import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import {
  fetchProducts,
  createProduct,
  updateProductStatus,
  deleteProduct,
  fetchObservations,
} from "../../src/lib/api";
import ObservationModal from "../../src/components/ObservationModal";
import AddToRoutineModal from "../../src/components/AddToRoutineModal";
import type { Product, ProductCategory, ProductStatus } from "../../src/types";

const STATUS_CONFIG: Record<ProductStatus, { labelKey: string; bg: string }> = {
  gozlemde: { labelKey: "products.observing", bg: "bg-blush" },
  aktif: { labelKey: "products.active", bg: "bg-sage" },
  birakildi: { labelKey: "products.dropped", bg: "bg-gray-200" },
};

const CATEGORY_KEYS: ProductCategory[] = [
  "temizleyici", "tonik", "serum", "nemlendirici", "gunes_kremi", "diger",
];

export default function ProductsScreen() {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [filter, setFilter] = useState<ProductStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);

  // Add to routine modal state
  const [routineModal, setRoutineModal] = useState<{
    visible: boolean;
    productId: string;
    productName: string;
  }>({ visible: false, productId: "", productName: "" });

  // Observation modal state
  const [obsModal, setObsModal] = useState<{
    visible: boolean;
    productId: string;
    productName: string;
    dayNumber: number;
  }>({ visible: false, productId: "", productName: "", dayNumber: 1 });

  const loadProducts = useCallback(async () => {
    if (!session?.user) return;
    try {
      const data = await fetchProducts(session.user.id);
      setProducts(data);
    } catch {}
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProducts();
    }, [loadProducts])
  );

  const handleAdd = async () => {
    if (!newName.trim() || !newCategory) {
      Alert.alert(t("common.error"), t("products.fillRequired"));
      return;
    }
    if (!session?.user) return;
    setAdding(true);
    try {
      await createProduct(session.user.id, newName, newCategory);
      setNewName("");
      setNewCategory(null);
      setShowAddModal(false);
      await loadProducts();
    } catch (err: any) {
      Alert.alert(t("common.error"), err.message);
    }
    setAdding(false);
  };

  const handleStatusChange = async (product: Product, newStatus: ProductStatus) => {
    try {
      await updateProductStatus(product.id, newStatus);
      await loadProducts();
    } catch (err: any) {
      Alert.alert(t("common.error"), err.message);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(t("products.deleteProduct"), t("products.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            await loadProducts();
          } catch (err: any) {
            Alert.alert(t("common.error"), err.message);
          }
        },
      },
    ]);
  };

  const openObservation = async (product: Product) => {
    // Calculate which day of observation
    if (!product.observation_start_date) return;
    const start = new Date(product.observation_start_date);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dayNumber = Math.min(Math.max(diffDays + 1, 1), 7);
    setObsModal({
      visible: true,
      productId: product.id,
      productName: product.name,
      dayNumber,
    });
  };

  const getObservationDay = (product: Product) => {
    if (!product.observation_start_date) return { current: 0, total: 7 };
    const start = new Date(product.observation_start_date);
    const today = new Date();
    const diff = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { current: Math.min(Math.max(diff + 1, 1), 7), total: 7 };
  };

  const filtered = products
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const FILTERS: { labelKey: string; value: ProductStatus | "all" }[] = [
    { labelKey: "products.all", value: "all" },
    { labelKey: "products.observing", value: "gozlemde" },
    { labelKey: "products.active", value: "aktif" },
    { labelKey: "products.dropped", value: "birakildi" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadProducts();
              setRefreshing(false);
            }}
            tintColor="#2D2D2D"
          />
        }
      >
        <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-charcoal">{t("products.title")}</Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-charcoal items-center justify-center"
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="px-6 mb-3">
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3">
            <Ionicons name="search-outline" size={18} color="#AAAAAA" />
            <TextInput
              className="flex-1 ml-3 text-charcoal text-base"
              placeholder={t("products.searchPlaceholder") || "Ara..."}
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#AAAAAA" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              className={`mr-2 px-5 py-2.5 rounded-2xl ${
                filter === f.value ? "bg-charcoal" : "bg-white"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === f.value ? "text-white" : "text-smoke"
                }`}
              >
                {t(f.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color="#2D2D2D" className="mt-8" />
        ) : (
          <View className="px-6 gap-3 mb-8">
            {filtered.map((product) => {
              const statusCfg = STATUS_CONFIG[product.status];
              const obs = getObservationDay(product);
              return (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onLongPress={() => handleDelete(product)}
                  className="bg-white rounded-card p-5"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-charcoal font-semibold text-base">
                        {product.name}
                      </Text>
                      <Text className="text-smoke text-sm mt-1">
                        {t(`products.${product.category}`)}
                      </Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-xl ${statusCfg.bg}`}>
                      <Text className="text-charcoal text-xs font-medium">
                        {t(statusCfg.labelKey)}
                      </Text>
                    </View>
                  </View>

                  {/* Observation progress */}
                  {product.status === "gozlemde" && (
                    <View className="mt-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-smoke text-xs">
                          {t("products.dayProgress", {
                            current: obs.current,
                            total: obs.total,
                          })}
                        </Text>
                        <TouchableOpacity
                          className="flex-row items-center gap-1"
                          onPress={() => openObservation(product)}
                        >
                          <Text className="text-charcoal text-xs font-medium">
                            {t("products.enterNote")}
                          </Text>
                          <Ionicons name="chevron-forward" size={12} color="#2D2D2D" />
                        </TouchableOpacity>
                      </View>
                      <View className="h-2 bg-cream rounded-full overflow-hidden">
                        <View
                          className="h-full bg-blush rounded-full"
                          style={{ width: `${(obs.current / obs.total) * 100}%` }}
                        />
                      </View>
                    </View>
                  )}

                  {/* Status actions */}
                  {product.status === "gozlemde" && obs.current >= 7 && (
                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        className="flex-1 bg-sage rounded-xl py-2 items-center"
                        onPress={() => handleStatusChange(product, "aktif")}
                      >
                        <Text className="text-charcoal text-xs font-medium">
                          {t("products.markActive")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 bg-gray-200 rounded-xl py-2 items-center"
                        onPress={() => handleStatusChange(product, "birakildi")}
                      >
                        <Text className="text-smoke text-xs font-medium">
                          {t("products.markDropped")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Add to routine button for active products */}
                  {(product.status === "aktif" || product.status === "gozlemde") && (
                    <TouchableOpacity
                      className="mt-3 flex-row items-center justify-center gap-2 bg-cream rounded-xl py-2.5"
                      onPress={() =>
                        setRoutineModal({
                          visible: true,
                          productId: product.id,
                          productName: product.name,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#2D2D2D" />
                      <Text className="text-charcoal text-xs font-medium">
                        {t("routineAction.addToRoutine")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}

            {filtered.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="flask-outline" size={48} color="#AAAAAA" />
                <Text className="text-smoke mt-4 text-base">
                  {t("products.noProducts")}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-charcoal">
                {t("products.addProduct")}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6B6B6B" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-smoke mb-2 ml-1">{t("products.productName")}</Text>
            <TextInput
              className="bg-cloud rounded-2xl px-5 py-4 text-charcoal text-base mb-4"
              placeholder={t("products.productPlaceholder")}
              placeholderTextColor="#AAAAAA"
              value={newName}
              onChangeText={setNewName}
            />

            <Text className="text-sm text-smoke mb-3 ml-1">{t("products.category")}</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {CATEGORY_KEYS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl ${
                    newCategory === cat ? "bg-charcoal" : "bg-cloud"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm ${
                      newCategory === cat ? "text-white font-medium" : "text-smoke"
                    }`}
                  >
                    {t(`products.${cat}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-cream/60 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="information-circle-outline" size={16} color="#6B6B6B" />
                <Text className="text-smoke text-xs font-medium">
                  {t("products.observationInfo")}
                </Text>
              </View>
              <Text className="text-smoke text-xs">{t("products.observationDesc")}</Text>
            </View>

            <TouchableOpacity
              className="bg-charcoal rounded-2xl py-4 items-center"
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                {adding ? t("common.loading") : t("products.addButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Observation Modal */}
      <ObservationModal
        visible={obsModal.visible}
        onClose={() => setObsModal((p) => ({ ...p, visible: false }))}
        productId={obsModal.productId}
        productName={obsModal.productName}
        dayNumber={obsModal.dayNumber}
        onSaved={loadProducts}
      />

      {/* Add to Routine Modal */}
      <AddToRoutineModal
        visible={routineModal.visible}
        onClose={() => setRoutineModal((p) => ({ ...p, visible: false }))}
        productId={routineModal.productId}
        productName={routineModal.productName}
        onAdded={loadProducts}
      />
    </SafeAreaView>
  );
}
