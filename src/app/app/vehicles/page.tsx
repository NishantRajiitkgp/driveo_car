'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { VEHICLE_TYPE_LABELS } from '@/lib/pricing';
import { VEHICLE_MAKE_LIST, getModelsForMake, getYearRange } from '@/lib/vehicle-data';
import { toast } from 'sonner';
import { Car, Plus, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle, VehicleType } from '@/types';

const yearOptions = getYearRange().map(String);

const vehicleTypes: VehicleType[] = [
  'sedan', 'coupe', 'crossover', 'suv', 'minivan', 'pickup', 'large_suv', 'convertible',
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formType, setFormType] = useState<VehicleType>('sedan');
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formColor, setFormColor] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadVehicles() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_primary', { ascending: false });

    if (data) setVehicles(data);
    setLoading(false);
  }

  useEffect(() => { loadVehicles(); }, []);

  async function addVehicle() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('vehicles').insert({
      customer_id: user.id,
      make: formMake,
      model: formModel,
      year: parseInt(formYear),
      color: formColor || null,
      type: formType,
      is_primary: vehicles.length === 0,
    });

    if (error) {
      toast.error('Failed to add vehicle');
    } else {
      toast.success('Vehicle added');
      setDialogOpen(false);
      setFormMake('');
      setFormModel('');
      setFormColor('');
      loadVehicles();
    }
    setSaving(false);
  }

  async function setPrimary(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Unset all primary
    await supabase.from('vehicles').update({ is_primary: false }).eq('customer_id', user.id);
    // Set new primary
    await supabase.from('vehicles').update({ is_primary: true }).eq('id', id);
    toast.success('Primary vehicle updated');
    loadVehicles();
  }

  async function deleteVehicle(id: string) {
    if (!confirm('Remove this vehicle?')) return;
    try {
      const res = await fetch('/api/vehicles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Failed to delete vehicle');
        return;
      }
      toast.success('Vehicle removed');
      loadVehicles();
    } catch {
      toast.error('Failed to delete vehicle');
    }
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display text-white">My Vehicles</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button size="sm" className="bg-[#E23232] hover:bg-[#c92a2a] text-white">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {vehicleTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFormType(t)}
                      className={cn(
                        'p-2 rounded-lg border text-xs text-center transition-all',
                        formType === t
                          ? 'border-[#E23232] bg-[#E23232]/10 text-white'
                          : 'border-white/10 text-white/50 hover:border-white/20'
                      )}
                    >
                      {VEHICLE_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Year</Label>
                  <AutocompleteInput options={yearOptions} value={formYear} onChange={setFormYear} placeholder="e.g. 2024" className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Make</Label>
                  <AutocompleteInput options={VEHICLE_MAKE_LIST} value={formMake} onChange={(val) => { setFormMake(val); if (val !== formMake) setFormModel(''); }} placeholder="e.g. Honda" className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Model</Label>
                  <AutocompleteInput options={getModelsForMake(formMake)} value={formModel} onChange={setFormModel} placeholder={formMake ? `${formMake} model` : 'Select make first'} className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Color (optional)</Label>
                <Input placeholder="Silver" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20" />
              </div>
              <Button onClick={addVehicle} disabled={saving || !formMake || !formModel} className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white">
                {saving ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-[#0a0a0a] border-white/10">
              <CardContent className="p-4 h-20 animate-pulse bg-white/5 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="bg-[#0a0a0a] border-dashed border-white/20">
          <CardContent className="p-8 text-center">
            <Car className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No vehicles yet. Add one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <Card key={v.id} className={cn('bg-[#0a0a0a] transition-all', v.is_primary ? 'border-[#E23232]/30' : 'border-white/10')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
                  <Car className="w-5 h-5 text-white/40" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">
                      {v.year} {v.make} {v.model}
                    </p>
                    {v.is_primary && (
                      <span className="text-[9px] uppercase tracking-widest text-[#E23232] bg-[#E23232]/10 px-1.5 py-0.5 rounded">Primary</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs capitalize">
                    {VEHICLE_TYPE_LABELS[v.type]}{v.color ? ` · ${v.color}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!v.is_primary && (
                    <button onClick={() => setPrimary(v.id)} className="p-2 text-white/30 hover:text-[#E23232] transition-colors" title="Set as primary">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteVehicle(v.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
