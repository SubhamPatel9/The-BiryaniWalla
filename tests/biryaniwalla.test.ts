import test from 'node:test';
import assert from 'node:assert/strict';

interface Portion {
  label: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  category: 'biryani' | 'mandi' | 'starters' | 'accompaniments';
  isVeg: boolean;
  portions: Portion[];
}

interface BagItem {
  id: string;
  portion: string;
  price: number;
  qty: number;
}

function filterMenu(items: MenuItem[], category: string, vegOnly: boolean): MenuItem[] {
  return items.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category;
    const vegMatch = !vegOnly || item.isVeg;
    return categoryMatch && vegMatch;
  });
}

function calculateBagTotals(bag: BagItem[]): { totalQty: number; subtotal: number } {
  return bag.reduce(
    (acc, item) => ({
      totalQty: acc.totalQty + item.qty,
      subtotal: acc.subtotal + item.price * item.qty,
    }),
    { totalQty: 0, subtotal: 0 }
  );
}

function validateReservationInput(input: { name: string; phone: string; date: string }): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (input.name.trim().length < 2) errors.push('name');
  if (input.phone.replace(/\D/g, '').length < 10) errors.push('phone');
  if (!input.date) errors.push('date');
  return { valid: errors.length === 0, errors };
}

const SAMPLE_MENU: MenuItem[] = [
  {
    id: 'hyd-chicken-dum',
    name: 'Hyderabadi Chicken Dum Biryani',
    category: 'biryani',
    isVeg: false,
    portions: [{ label: 'Regular', price: 220 }],
  },
  {
    id: 'paneer-tikka-dum',
    name: 'Paneer Tikka Dum Biryani',
    category: 'biryani',
    isVeg: true,
    portions: [{ label: 'Regular', price: 200 }],
  },
  {
    id: 'chicken-alfaham-mandi',
    name: 'Chicken Alfaham Mandi',
    category: 'mandi',
    isVeg: false,
    portions: [
      { label: 'Single', price: 239 },
      { label: 'Half', price: 519 },
      { label: 'Full', price: 899 },
    ],
  },
  {
    id: 'paneer-afghani-mandi',
    name: 'Paneer Afghani Mandi',
    category: 'mandi',
    isVeg: true,
    portions: [
      { label: 'Single', price: 209 },
      { label: 'Half', price: 399 },
      { label: 'Full', price: 749 },
    ],
  },
];

test('filterMenu filters by category and pure-veg flag', () => {
  assert.equal(filterMenu(SAMPLE_MENU, 'all', false).length, 4);
  assert.equal(filterMenu(SAMPLE_MENU, 'mandi', false).length, 2);
  assert.equal(filterMenu(SAMPLE_MENU, 'mandi', true).length, 1);
  assert.equal(filterMenu(SAMPLE_MENU, 'all', true).length, 2);
});

test('calculateBagTotals sums quantities and rupee totals accurately', () => {
  const result = calculateBagTotals([
    { id: 'chicken-alfaham-mandi', portion: 'Half', price: 519, qty: 2 },
    { id: 'paneer-tikka-dum', portion: 'Regular', price: 200, qty: 1 },
  ]);
  assert.deepEqual(result, { totalQty: 3, subtotal: 1238 });
});

test('validateReservationInput rejects invalid name/phone and accepts valid guest details', () => {
  const invalid = validateReservationInput({ name: 'A', phone: '12345', date: '' });
  assert.equal(invalid.valid, false);
  assert.deepEqual(invalid.errors, ['name', 'phone', 'date']);

  const valid = validateReservationInput({
    name: 'Ananya Dash',
    phone: '+91 98765 43210',
    date: '2026-11-17',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, []);
});
