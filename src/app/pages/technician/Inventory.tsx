import { Package, Search, Plus, AlertCircle, Loader2, Signal } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchInventory } from '../../data/api';

export default function TechnicianInventory() {
  const { data: inventory, isLoading, error } = useApi(fetchInventory);

  const stock = Array.isArray(inventory) ? inventory : (inventory?.items || inventory?.inventory || []);
  const isLive = !error && !!inventory;

  if (isLoading && !inventory) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#F4A261] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl text-[#0A1128] font-semibold">Inventory Tracker</h2>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
              <Signal className="w-3 h-3 text-[#6A994E]" />
              <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B7C]" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 bg-white border border-[#E8EEF2] rounded-lg focus:outline-none focus:border-[#F4A261] text-sm w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F4A261] text-white rounded-lg text-sm font-semibold hover:bg-[#ee9144] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm">
          <p className="text-xs text-[#5A6B7C] uppercase font-bold tracking-wider mb-2">Total Items</p>
          <p className="text-3xl font-semibold text-[#0A1128]">{stock.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm border-l-4 border-l-[#E76F51]">
          <p className="text-xs text-[#E76F51] uppercase font-bold tracking-wider mb-2">Out of Stock</p>
          <p className="text-3xl font-semibold text-[#0A1128]">
            {stock.filter(i => i.stock === 0).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm border-l-4 border-l-[#F4A261]">
          <p className="text-xs text-[#F4A261] uppercase font-bold tracking-wider mb-2">Low Stock</p>
          <p className="text-3xl font-semibold text-[#0A1128]">
            {stock.filter(i => i.stock > 0 && i.stock <= i.minStock).length}
          </p>
        </div>
        <div className="bg-[#E8EEF2] p-6 rounded-xl">
          <p className="text-xs text-[#5A6B7C] uppercase font-bold tracking-wider mb-2">Pending Orders</p>
          <p className="text-3xl font-semibold text-[#0A1128]">0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] border-b border-[#E8EEF2]">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">Item Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">In Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EEF2]">
            {stock.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#5A6B7C]">
                  No inventory data available from API.
                </td>
              </tr>
            ) : (
              stock.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-[#5A6B7C]" />
                      <span className="font-medium text-[#0A1128]">{item.item}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5A6B7C]">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#0A1128]">
                    {item.stock} units
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold uppercase ${
                      item.status === 'In Stock' ? 'text-[#6A994E]' : 'text-[#E76F51]'
                    }`}>
                      {item.status !== 'In Stock' && <AlertCircle className="w-3.5 h-3.5" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#F4A261] text-sm font-bold hover:underline">Reorder</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
