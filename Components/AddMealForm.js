import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal, FlatList } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { globalStyles } from '../styles/theme';
import { WHOLE_FOODS } from '../data/wholeFoods';

export default function AddMealForm({ onAddMeal }) {
  const [food, setFood] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [baseNutrition, setBaseNutrition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanLock, setScanLock] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const getNumber = (value, fallback = '0') => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return fallback;
    return Math.round(parsed).toString();
  };

  const getPortionMultiplier = (value) => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed) || parsed <= 0) return 1;
    return parsed;
  };

  const mapProductToMacros = (product) => {
    const n = product?.nutriments || {};
    const caloriesValue = n['energy-kcal_serving'] ?? n['energy-kcal_100g'] ?? n['energy-kcal'] ?? n.energy_value ?? 0;
    const proteinValue = n.proteins_serving ?? n.proteins_100g ?? 0;
    const carbsValue = n.carbohydrates_serving ?? n.carbohydrates_100g ?? 0;
    const fatsValue = n.fat_serving ?? n.fat_100g ?? 0;

    return {
      name: product.product_name || product.product_name_en || 'Unknown food',
      calories: getNumber(caloriesValue),
      protein: getNumber(proteinValue),
      carbs: getNumber(carbsValue),
      fats: getNumber(fatsValue),
    };
  };

  const getPreviewCalories = (product) => {
    const n = product?.nutriments || {};
    const caloriesValue = n['energy-kcal_serving'] ?? n['energy-kcal_100g'] ?? n['energy-kcal'] ?? n.energy_value;
    const parsed = parseFloat(caloriesValue);
    return Number.isNaN(parsed) ? null : Math.round(parsed);
  };

  const applyProduct = (product) => {
    const mapped = mapProductToMacros(product);
    const nutritionBase = {
      calories: parseFloat(mapped.calories) || 0,
      protein: parseFloat(mapped.protein) || 0,
      carbs: parseFloat(mapped.carbs) || 0,
      fats: parseFloat(mapped.fats) || 0,
    };
    setBaseNutrition(nutritionBase);
    setFood(mapped.name);
    setPortionSize('1');
    setCalories(getNumber(nutritionBase.calories));
    setProtein(getNumber(nutritionBase.protein));
    setCarbs(getNumber(nutritionBase.carbs));
    setFats(getNumber(nutritionBase.fats));
  };

  const lookupByBarcode = async (code) => {
    if (!code) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
      const data = await response.json();
      if (data?.status === 1 && data?.product) {
        applyProduct(data.product);
      }
    } catch (error) {
      // noop for now; user can retry or use typed search.
    } finally {
      setIsLoading(false);
    }
  };

  const lookupBySearch = async () => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) return;
    setIsResultsModalOpen(true);
    setIsLoading(true);
    try {
      const localMatches = WHOLE_FOODS
        .filter((foodItem) => foodItem.name.toLowerCase().includes(trimmed))
        .map((foodItem) => ({
          code: foodItem.id,
          product_name: foodItem.name,
          brands: `Whole Foods DB - ${foodItem.serving}`,
          nutriments: {
            'energy-kcal_serving': foodItem.calories,
            proteins_serving: foodItem.protein,
            carbohydrates_serving: foodItem.carbs,
            fat_serving: foodItem.fats,
          },
        }));

      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&search_simple=1&action=process&json=1&page_size=12`
      );
      const data = await response.json();
      const remoteProducts = data?.products || [];
      const seen = new Set(localMatches.map((item) => item.product_name.toLowerCase()));
      const merged = [...localMatches];
      remoteProducts.forEach((item) => {
        const key = (item?.product_name || '').toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push(item);
      });
      setResults(merged);
    } catch (error) {
      const localOnly = WHOLE_FOODS
        .filter((foodItem) => foodItem.name.toLowerCase().includes(trimmed))
        .map((foodItem) => ({
          code: foodItem.id,
          product_name: foodItem.name,
          brands: `Whole Foods DB - ${foodItem.serving}`,
          nutriments: {
            'energy-kcal_serving': foodItem.calories,
            proteins_serving: foodItem.protein,
            carbohydrates_serving: foodItem.carbs,
            fat_serving: foodItem.fats,
          },
        }));
      setResults(localOnly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!food || !calories) return;
    onAddMeal({ food, portionSize, calories, protein, carbs, fats });
    setFood('');
    setPortionSize('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setBaseNutrition(null);
    setSearchTerm('');
    setResults([]);
    setIsResultsModalOpen(false);
  };

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.sectionTitle}>OpenFoodFacts Lookup</Text>

      <View style={globalStyles.lookupSearchRow}>
        <Text style={globalStyles.searchIcon}>⌕</Text>
        <TextInput
          style={globalStyles.searchInput}
          placeholder="Search food by name..."
          placeholderTextColor="#94A3B8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {!!searchTerm && (
          <TouchableOpacity onPress={() => { setSearchTerm(''); setResults([]); }}>
            <Text style={globalStyles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={globalStyles.secondaryButtonWide} onPress={lookupBySearch}>
        <Text style={globalStyles.secondaryButtonText}>{isLoading ? 'Searching...' : 'Search OpenFoodFacts'}</Text>
      </TouchableOpacity>
      <Text style={globalStyles.lookupHint}>
        Enter a food name, then tap search to view results.
      </Text>

      <Modal
        visible={isResultsModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsResultsModalOpen(false)}
      >
        <View style={globalStyles.modalBackdrop}>
          <View style={globalStyles.modalCard}>
            <View style={globalStyles.modalHeaderRow}>
              <View>
                <Text style={globalStyles.modalTitle}>Search Results</Text>
                <Text style={globalStyles.modalSubtitle}>
                  "{searchTerm.trim()}" - {results.length} items
                </Text>
              </View>
              <TouchableOpacity style={globalStyles.modalCloseButton} onPress={() => setIsResultsModalOpen(false)}>
                <Text style={globalStyles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <View style={globalStyles.modalStateWrap}>
                <Text style={globalStyles.lookupHint}>Searching OpenFoodFacts...</Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item, index) => item.code || `${item.product_name}-${index}`}
                style={globalStyles.modalResultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={globalStyles.modalResultCard}
                    onPress={() => {
                      applyProduct(item);
                      setIsResultsModalOpen(false);
                    }}
                  >
                    <View style={globalStyles.modalResultTopRow}>
                      <Text style={globalStyles.searchResultTitle}>{item.product_name || 'Unnamed product'}</Text>
                      {getPreviewCalories(item) !== null && (
                        <View style={globalStyles.kcalPill}>
                          <Text style={globalStyles.kcalPillText}>{getPreviewCalories(item)} kcal</Text>
                        </View>
                      )}
                    </View>
                    <Text style={globalStyles.searchResultSub}>{item.brands || 'OpenFoodFacts'}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={globalStyles.modalItemSeparator} />}
                ListEmptyComponent={
                  <View style={globalStyles.modalStateWrap}>
                    <Text style={globalStyles.lookupHint}>No related foods found.</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={globalStyles.secondaryButtonWide}
        onPress={async () => {
          if (!permission?.granted) await requestPermission();
          setIsScannerOpen((v) => !v);
        }}
      >
        <Text style={globalStyles.secondaryButtonText}>{isScannerOpen ? 'Close Scanner' : 'Scan Barcode'}</Text>
      </TouchableOpacity>

      {isScannerOpen && permission?.granted && (
        <View style={globalStyles.scannerWrap}>
          <CameraView
            style={globalStyles.scanner}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
            onBarcodeScanned={({ data }) => {
              if (scanLock) return;
              setScanLock(true);
              lookupByBarcode(data);
              setTimeout(() => setScanLock(false), 1200);
            }}
          />
        </View>
      )}

      <Text style={globalStyles.label}>Food Name</Text>
      <TextInput style={globalStyles.input} placeholder="Food Name" placeholderTextColor="#94A3B8" value={food} onChangeText={setFood} />
      <Text style={globalStyles.label}>Portion Size</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Servings (e.g. 1, 1.5, 2)"
        placeholderTextColor="#94A3B8"
        keyboardType="decimal-pad"
        value={portionSize}
        onChangeText={(value) => {
          setPortionSize(value);
          if (!baseNutrition) return;
          const multiplier = getPortionMultiplier(value);
          setCalories(getNumber(baseNutrition.calories * multiplier));
          setProtein(getNumber(baseNutrition.protein * multiplier));
          setCarbs(getNumber(baseNutrition.carbs * multiplier));
          setFats(getNumber(baseNutrition.fats * multiplier));
        }}
      />
      <Text style={globalStyles.label}>Calories</Text>
      <TextInput style={globalStyles.input} placeholder="Calories" placeholderTextColor="#94A3B8" keyboardType="numeric" value={calories} onChangeText={setCalories} />
      <Text style={globalStyles.label}>Macros (grams)</Text>
      <View style={globalStyles.inputRow}>
        
        {/* Protein Column */}
        <View style={styles.macroCol}>
          <TextInput 
            style={[globalStyles.input, globalStyles.macroInput, { marginBottom: 4 }]} 
            placeholder="0" 
            placeholderTextColor="#94A3B8" 
            keyboardType="numeric" 
            value={protein} 
            onChangeText={setProtein} 
          />
          <Text style={styles.subLabel}>PROTEIN</Text>
        </View>

        {/* Carbs Column */}
        <View style={styles.macroCol}>
          <TextInput 
            style={[globalStyles.input, globalStyles.macroInput, { marginBottom: 4 }]} 
            placeholder="0" 
            placeholderTextColor="#94A3B8" 
            keyboardType="numeric" 
            value={carbs} 
            onChangeText={setCarbs} 
          />
          <Text style={styles.subLabel}>CARBS</Text>
        </View>

        {/* Fats Column */}
        <View style={styles.macroCol}>
          <TextInput 
            style={[globalStyles.input, globalStyles.macroInput, { marginBottom: 4 }]} 
            placeholder="0" 
            placeholderTextColor="#94A3B8" 
            keyboardType="numeric" 
            value={fats} 
            onChangeText={setFats} 
          />
          <Text style={styles.subLabel}>FATS</Text>
        </View>

      </View>

      <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
        <Text style={globalStyles.buttonText}>{isLoading ? 'Loading...' : 'Log Meal'}</Text>
      </TouchableOpacity>

    </View>
  );
}
const styles = {
  macroCol: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B', 
    letterSpacing: 0.5,
  }
};