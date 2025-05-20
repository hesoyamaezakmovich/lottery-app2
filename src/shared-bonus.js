import { supabase } from "./supabaseClient";

// Получить количество кристаллов пользователя
export async function getUserCrystals(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("crystals")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data?.crystals ?? 0;
}

// Обновить количество кристаллов пользователя (установить новое значение)
export async function setUserCrystals(userId, newAmount) {
  const { error } = await supabase
    .from("users")
    .update({ crystals: newAmount })
    .eq("id", userId);
  if (error) throw error;
  return true;
}

// Изменить количество кристаллов пользователя (прибавить/отнять)
export async function updateUserCrystals(userId, delta) {
  const current = await getUserCrystals(userId);
  return setUserCrystals(userId, current + delta);
}

// Получить VIP-уровень пользователя
export async function getUserVipLevel(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("vip_level")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data?.vip_level ?? 0;
}

// Обновить VIP-уровень пользователя
export async function setUserVipLevel(userId, newLevel) {
  const { error } = await supabase
    .from("users")
    .update({ vip_level: newLevel })
    .eq("id", userId);
  if (error) throw error;
  return true;
} 