import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  label?: string;
}

export const QuantitySelector = ({ quantity, onChange, label = 'Servings' }: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1) onChange(quantity - 1);
    else if (quantity > 0.5) onChange(0.5);
  };

  const handleIncrease = () => {
    if (quantity < 1) onChange(1);
    else onChange(quantity + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleDecrease}
          disabled={quantity <= 0.5}
        >
          <Ionicons name="remove" size={24} color={quantity <= 0.5 ? colors.border : colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{quantity}</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleIncrease}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    ...typography.title,
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
});
