import { useState } from 'react';
import { Package, Search, Plus, AlertCircle, Loader2, Signal, X, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { fetchInventory, addInventoryItem, reorderInventory, InventoryItem, isLiveResponse } from '../../data/api';

export default function TechnicianInventory() {
  const { data: inventory, isLoading, refetch } = useApi<InventoryItem[]>(fetchInventory, {
    cacheKey: 'technician-inventory'
  });

  const stock: InventoryItem[] = Array.isArray(inventory)
    ? inventory
    : ((inventory as unknown as { items?: InventoryItem[]; inventory?: InventoryItem[] })?.items ||
       (inventory as unknown as { inventory?: InventoryItem[] })?.inventory || []);
  const isLive = isLiveResponse(inventory);

  const [searchTerm, setSearchTerm] = useState('');

  // Add Item Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Masks');
  const [newItemStock, setNewItemStock] = useState<number>(10);
  const [newItemMinStock, setNewItemMinStock] = useState<number>(5);

  // Reorder Modal States
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [reorderQty, setReorderQty] = useState<number>(10);
  const [reorderVendor, setReorderVendor] = useState('Linde Clinical Logistics');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading && !inventory) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-amber animate-spin" />
      </div>
    );
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) {
      toast.error("Please specify item name.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addInventoryItem({
        item: newItemName,
        category: newItemCategory,
        stock: newItemStock,
        min_stock: newItemMinStock,
        status: newItemStock > 0 ? 'In Stock' : 'Out of Stock'
      });
      toast.success(`${newItemName} added to inventory!`);
      refetch();
      setShowAddModal(false);
      setNewItemName('');
      setNewItemCategory('Masks');
      setNewItemStock(10);
      setNewItemMinStock(5);
    } catch (err) {
      toast.error("Failed to add inventory item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reorderInventory({
        item_id: selectedItemId,
        quantity: reorderQty,
        vendor: reorderVendor
      });
      toast.success(`Reorder request for ${reorderQty} units of ${selectedItemName} submitted successfully!`);
      refetch();
      setShowReorderModal(false);
      setSelectedItemId('');
      setSelectedItemName('');
      setReorderQty(10);
    } catch (err) {
      toast.error("Failed to submit reorder request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStock = stock.filter((item: any) => 
    item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl text-navy font-semibold">Inventory Tracker</h2>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-sage/10 border border-sage/20 rounded-md">
              <Signal className="w-3 h-3 text-sage" />
              <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 bg-card border border-light-blue rounded-lg focus:outline-none focus:border-amber text-sm w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber text-white rounded-lg text-sm font-semibold hover:bg-amber/90 transition-colors shadow-sm active:scale-95 duration-200"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm">
          <p className="text-xs text-slate-muted uppercase font-bold tracking-wider mb-2">Total Items</p>
          <p className="text-3xl font-semibold text-navy">{stock.length}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm border-l-4 border-l-coral">
          <p className="text-xs text-coral uppercase font-bold tracking-wider mb-2">Out of Stock</p>
          <p className="text-3xl font-semibold text-navy">
            {stock.filter((i: any) => i.stock === 0).length}
          </p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm border-l-4 border-l-amber">
          <p className="text-xs text-amber uppercase font-bold tracking-wider mb-2">Low Stock</p>
          <p className="text-3xl font-semibold text-navy">
            {stock.filter((i: any) => i.stock > 0 && i.stock <= i.minStock).length}
          </p>
        </div>
        <div className="bg-light-blue/40 p-6 rounded-xl">
          <p className="text-xs text-slate-muted uppercase font-bold tracking-wider mb-2">Supplier</p>
          <p className="text-sm font-bold text-navy truncate">{reorderVendor}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-light-blue shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background border-b border-light-blue">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">Item Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">In Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-blue">
            {filteredStock.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-muted">
                  {searchTerm ? 'No items found matching search term.' : 'No inventory data available from API.'}
                </td>
              </tr>
            ) : (
              filteredStock.map((item: any) => (
                <tr key={item.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-slate-muted" />
                      <span className="font-medium text-navy">{item.item}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-muted">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-navy">
                    {item.stock} units
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold uppercase ${
                      item.stock === 0 ? 'text-coral' : item.stock <= item.minStock ? 'text-amber' : 'text-sage'
                    }`}>
                      {item.stock <= item.minStock && <AlertCircle className="w-3.5 h-3.5" />}
                      {item.stock === 0 ? 'Out of Stock' : item.stock <= item.minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedItemId(String(item.id || item.item));
                        setSelectedItemName(item.item);
                        setShowReorderModal(true);
                      }}
                      className="text-amber text-sm font-bold hover:underline"
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <form onSubmit={handleAddItem} className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">Add Inventory Item</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-muted hover:text-navy">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AirFit N30i Mask (Medium)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-background border border-light-blue rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full bg-background border border-light-blue rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber outline-none"
                >
                  <option value="Masks">Masks & Headgear</option>
                  <option value="Tubes">Hoses & Tubes</option>
                  <option value="Filters">Air Filters</option>
                  <option value="Humidifiers">Humidifier Chambers</option>
                  <option value="Wearables">Biomarker Wearables</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-light-blue rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Min Limit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-background border border-light-blue rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                disabled={isSubmitting}
                className="flex-1 py-4 bg-light-blue text-slate-muted font-bold rounded-xl text-xs hover:bg-light-blue/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-navy text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5 hover:bg-navy/90 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reorder Modal */}
      {showReorderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <form onSubmit={handleReorder} className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">Submit Reorder Request</h3>
              <button type="button" onClick={() => setShowReorderModal(false)} className="text-slate-muted hover:text-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-background border border-light-blue p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-muted uppercase tracking-wider block mb-1">Target Item</span>
                <span className="text-sm font-bold text-navy">{selectedItemName}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Reorder Quantity</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={reorderQty}
                  onChange={(e) => setReorderQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-background border border-light-blue rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Preferred Vendor</label>
                <input
                  type="text"
                  required
                  value={reorderVendor}
                  onChange={(e) => setReorderVendor(e.target.value)}
                  className="w-full bg-background border border-light-blue rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowReorderModal(false)} 
                disabled={isSubmitting}
                className="flex-1 py-4 bg-light-blue text-slate-muted font-bold rounded-xl text-xs hover:bg-light-blue/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-amber text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5 hover:bg-amber/90 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                Reorder Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
