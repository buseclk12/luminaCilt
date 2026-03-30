import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import { fetchProducts, createProduct, deleteProduct } from "../../src/lib/api";
import ObservationModal from "../../src/components/ObservationModal";
import AddToRoutineModal from "../../src/components/AddToRoutineModal";
import type { Product, ProductCategory } from "../../src/types";
import { F } from "../../src/lib/fonts";

const { width } = Dimensions.get("window");
const CARD_GAP = 10;
const CARD_W = (width - 48 - CARD_GAP) / 2;

const CATS: ProductCategory[] = ["temizleyici", "tonik", "serum", "nemlendirici", "gunes_kremi", "diger"];
const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = { temizleyici: "water-outline", tonik: "beaker-outline", serum: "sparkles-outline", nemlendirici: "snow-outline", gunes_kremi: "sunny-outline", diger: "ellipse-outline" };

const STATUS_COLOR: Record<string, string> = { gozlemde: "#555", aktif: "#000", birakildi: "#CCC" };

export default function ProductsScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { session } = useAuthStore();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [routineM, setRoutineM] = useState({ visible: false, productId: "", productName: "" });
  const [obsM, setObsM] = useState({ visible: false, productId: "", productName: "", dayNumber: 1 });

  const load = useCallback(async () => {
    if (!session?.user) return;
    try { setProducts(await fetchProducts(session.user.id)); } catch {}
    setLoading(false);
  }, [session]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const add = async () => {
    if (!name.trim() || !cat) { Alert.alert(t("common.error"), t("products.fillRequired")); return; }
    if (!session?.user) return;
    setAdding(true);
    try { await createProduct(session.user.id, name, cat); setName(""); setCat(null); setModal(false); load(); } catch (e: any) { Alert.alert(t("common.error"), e.message); }
    setAdding(false);
  };

  const filtered = products.filter((p) => filter === "all" || p.status === filter).filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const getDay = (p: Product) => Math.min(Math.max(Math.floor((Date.now() - new Date(p.observation_start_date || "").getTime()) / 86400000) + 1, 1), 7);

  const counts = {
    all: products.length,
    gozlemde: products.filter((p) => p.status === "gozlemde").length,
    aktif: products.filter((p) => p.status === "aktif").length,
    birakildi: products.filter((p) => p.status === "birakildi").length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#000" />}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, marginTop: 16, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: F.heading, fontSize: 26, color: "#000" }}>{t("products.title")}</Text>
          <TouchableOpacity
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}
            onPress={() => setModal(true)}>
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View style={{
            flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 14,
            paddingHorizontal: 14, height: 44,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
          }}>
            <Ionicons name="search" size={16} color="#CCC" />
            <TextInput style={{ flex: 1, marginLeft: 10, fontFamily: F.regular, fontSize: 14, color: "#000" }} placeholder={t("products.searchPlaceholder")} placeholderTextColor="#CCC" value={search} onChangeText={setSearch} />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={16} color="#CCC" /></TouchableOpacity>}
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 6 }}>
          {(["all", "gozlemde", "aktif", "birakildi"] as const).map((f) => {
            const active = filter === f;
            const count = counts[f];
            return (
              <TouchableOpacity key={f} onPress={() => setFilter(f)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                  backgroundColor: active ? "#000" : "#FFF",
                  shadowColor: active ? "transparent" : "#000",
                  shadowOffset: { width: 0, height: 1 }, shadowOpacity: active ? 0 : 0.03, shadowRadius: 4,
                }}>
                <Text style={{ fontFamily: active ? F.medium : F.regular, fontSize: 12, color: active ? "#FFF" : "#888" }}>
                  {t(`products.${f === "all" ? "all" : f === "gozlemde" ? "observing" : f === "aktif" ? "active" : "dropped"}`)}
                </Text>
                <View style={{
                  backgroundColor: active ? "rgba(255,255,255,0.2)" : "#F5F5F5",
                  borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1,
                }}>
                  <Text style={{ fontFamily: F.medium, fontSize: 10, color: active ? "#FFF" : "#BBB" }}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? <ActivityIndicator size="small" color="#000" style={{ marginTop: 40 }} /> : (
          <View style={{ paddingHorizontal: 24, marginBottom: 100 }}>
            {/* Product cards grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: CARD_GAP }}>
              {filtered.map((p) => {
                const day = getDay(p);
                const statusColor = STATUS_COLOR[p.status] || "#999";
                return (
                  <TouchableOpacity key={p.id}
                    onPress={() => router.push(`/product/${p.id}`)}
                    onLongPress={() => Alert.alert(t("products.deleteProduct"), p.name, [
                      { text: t("common.cancel"), style: "cancel" },
                      { text: t("common.delete"), style: "destructive", onPress: () => { deleteProduct(p.id); load(); } },
                    ])}
                    activeOpacity={0.7}
                    style={{
                      width: CARD_W, backgroundColor: "#FFF", borderRadius: 16, padding: 16,
                      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
                    }}>
                    {/* Category icon */}
                    <View style={{
                      width: 40, height: 40, borderRadius: 12, backgroundColor: "#F8F8F8",
                      alignItems: "center", justifyContent: "center", marginBottom: 14,
                    }}>
                      <Ionicons name={CAT_ICON[p.category] || "ellipse-outline"} size={20} color="#333" />
                    </View>

                    {/* Name */}
                    <Text style={{ fontFamily: F.medium, fontSize: 14, color: "#000", marginBottom: 3 }} numberOfLines={2}>{p.name}</Text>
                    <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", marginBottom: 12 }}>{t(`products.${p.category}`)}</Text>

                    {/* Status + observation progress */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                      <Text style={{ fontFamily: F.light, fontSize: 10, color: "#999" }}>
                        {t(`products.${p.status === "gozlemde" ? "observing" : p.status === "aktif" ? "active" : "dropped"}`)}
                      </Text>
                    </View>

                    {p.status === "gozlemde" && (
                      <View style={{ marginTop: 10, height: 3, backgroundColor: "#F0F0F0", borderRadius: 2 }}>
                        <View style={{ height: "100%", backgroundColor: "#000", borderRadius: 2, width: `${(day / 7) * 100}%` }} />
                      </View>
                    )}

                    {/* Action buttons */}
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 12 }}>
                      {p.status === "gozlemde" && (
                        <TouchableOpacity
                          style={{ flex: 1, backgroundColor: "#F8F8F8", borderRadius: 10, paddingVertical: 8, alignItems: "center" }}
                          onPress={() => { const d = getDay(p); setObsM({ visible: true, productId: p.id, productName: p.name, dayNumber: d }); }}>
                          <Text style={{ fontFamily: F.medium, fontSize: 10, color: "#666" }}>{lang === "tr" ? `Gun ${day}/7` : `Day ${day}/7`}</Text>
                        </TouchableOpacity>
                      )}
                      {(p.status === "aktif" || p.status === "gozlemde") && (
                        <TouchableOpacity
                          style={{ flex: 1, backgroundColor: "#000", borderRadius: 10, paddingVertical: 8, alignItems: "center" }}
                          onPress={() => setRoutineM({ visible: true, productId: p.id, productName: p.name })}>
                          <Text style={{ fontFamily: F.medium, fontSize: 10, color: "#FFF" }}>+ {lang === "tr" ? "Rutine" : "Routine"}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {filtered.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFF",
                  alignItems: "center", justifyContent: "center", marginBottom: 16,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
                }}>
                  <Ionicons name="flask-outline" size={24} color="#CCC" />
                </View>
                <Text style={{ fontFamily: F.regular, color: "#BBB", fontSize: 14 }}>{t("products.noProducts")}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}>
            {/* Handle */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E5E5", alignSelf: "center", marginBottom: 20 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontFamily: F.heading, fontSize: 20, color: "#000" }}>{t("products.addProduct")}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{t("products.productName")}</Text>
            <TextInput
              style={{
                backgroundColor: "#F8F8F8", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
                fontFamily: F.regular, fontSize: 15, color: "#000", marginBottom: 24,
              }}
              placeholder={t("products.productPlaceholder")} placeholderTextColor="#CCC" value={name} onChangeText={setName}
            />

            <Text style={{ fontFamily: F.light, fontSize: 11, color: "#BBB", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>{t("products.category")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {CATS.map((c) => (
                <TouchableOpacity key={c} onPress={() => setCat(c)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                    backgroundColor: cat === c ? "#000" : "#F5F5F5",
                  }}>
                  <Ionicons name={CAT_ICON[c]} size={14} color={cat === c ? "#FFF" : "#888"} />
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: cat === c ? "#FFF" : "#666" }}>{t(`products.${c}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F5F5F5",
              borderRadius: 12, padding: 14, marginBottom: 24,
            }}>
              <Ionicons name="eye-outline" size={18} color="#999" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.medium, fontSize: 12, color: "#555" }}>{t("products.observationInfo")}</Text>
                <Text style={{ fontFamily: F.light, fontSize: 11, color: "#999", marginTop: 2 }}>{t("products.observationDesc")}</Text>
              </View>
            </View>

            <TouchableOpacity style={{ backgroundColor: "#000", borderRadius: 14, paddingVertical: 16, alignItems: "center" }} onPress={add} disabled={adding}>
              <Text style={{ fontFamily: F.semibold, color: "#FFF", fontSize: 14 }}>{adding ? "..." : t("products.addButton")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ObservationModal visible={obsM.visible} onClose={() => setObsM((p) => ({ ...p, visible: false }))} productId={obsM.productId} productName={obsM.productName} dayNumber={obsM.dayNumber} onSaved={load} />
      <AddToRoutineModal visible={routineM.visible} onClose={() => setRoutineM((p) => ({ ...p, visible: false }))} productId={routineM.productId} productName={routineM.productName} onAdded={load} />
    </SafeAreaView>
  );
}
