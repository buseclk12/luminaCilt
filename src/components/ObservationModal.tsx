import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore";
import { createObservation } from "../lib/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  dayNumber: number;
  onSaved: () => void;
}

const SCORE_EMOJIS = ["😊", "🙂", "😐", "😟", "😣"];
const HYDRATION_EMOJIS = ["🏜️", "💧", "💦", "🌊", "🌊"];

function ScoreSelector({
  label,
  value,
  onChange,
  emojis,
  labels,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  emojis: string[];
  labels: string[];
}) {
  return (
    <View className="mb-5">
      <Text className="text-charcoal font-medium text-sm mb-3">{label}</Text>
      <View className="flex-row justify-between">
        {[1, 2, 3, 4, 5].map((score) => (
          <TouchableOpacity
            key={score}
            onPress={() => onChange(score)}
            className={`items-center px-3 py-2 rounded-2xl ${
              value === score ? "bg-charcoal" : "bg-white"
            }`}
            activeOpacity={0.7}
          >
            <Text className="text-lg mb-1">{emojis[score - 1]}</Text>
            <Text
              className={`text-xs ${
                value === score ? "text-white" : "text-smoke"
              }`}
            >
              {labels[score - 1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ObservationModal({
  visible,
  onClose,
  productId,
  productName,
  dayNumber,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [irritation, setIrritation] = useState(3);
  const [breakout, setBreakout] = useState(3);
  const [hydration, setHydration] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const irritationLabels = [1, 2, 3, 4, 5].map((n) =>
    t(`observation.scores.${n}`)
  );
  const hydrationLabels = [1, 2, 3, 4, 5].map((n) =>
    t(`observation.hydrationScores.${n}`)
  );

  const handleSave = async () => {
    if (!session?.user) return;
    setSaving(true);
    try {
      await createObservation(
        session.user.id,
        productId,
        dayNumber,
        irritation,
        breakout,
        hydration,
        note.trim() || undefined
      );
      onSaved();
      onClose();
      // Reset
      setIrritation(3);
      setBreakout(3);
      setHydration(3);
      setNote("");
    } catch (err: any) {
      Alert.alert(t("common.error"), err.message);
    }
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-cloud rounded-t-3xl px-6 pt-6 pb-10">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-charcoal">
              {t("observation.title")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B6B6B" />
            </TouchableOpacity>
          </View>

          <Text className="text-smoke text-sm mb-1">{productName}</Text>
          <Text className="text-smoke text-xs mb-5">
            {t("observation.day", { number: dayNumber })}
          </Text>

          <Text className="text-charcoal font-semibold text-base mb-4">
            {t("observation.howIsYourSkin")}
          </Text>

          <ScoreSelector
            label={t("observation.irritation")}
            value={irritation}
            onChange={setIrritation}
            emojis={SCORE_EMOJIS}
            labels={irritationLabels}
          />

          <ScoreSelector
            label={t("observation.breakout")}
            value={breakout}
            onChange={setBreakout}
            emojis={SCORE_EMOJIS}
            labels={irritationLabels}
          />

          <ScoreSelector
            label={t("observation.hydration")}
            value={hydration}
            onChange={setHydration}
            emojis={HYDRATION_EMOJIS}
            labels={hydrationLabels}
          />

          <Text className="text-sm text-smoke mb-2 ml-1">
            {t("observation.note")}
          </Text>
          <TextInput
            className="bg-white rounded-2xl px-5 py-4 text-charcoal text-base mb-5"
            placeholder={t("observation.notePlaceholder")}
            placeholderTextColor="#AAAAAA"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />

          <TouchableOpacity
            className="bg-charcoal rounded-2xl py-4 items-center"
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">
              {saving ? t("common.loading") : t("observation.submit")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
