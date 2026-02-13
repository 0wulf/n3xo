import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import useGraphStore from '@/store/useGraphStore';

function PersonForm() {
  const formModal = useGraphStore((s) => s.formModal);
  const editingItem = useGraphStore((s) => s.editingItem);
  const closeForm = useGraphStore((s) => s.closeForm);
  const addPerson = useGraphStore((s) => s.addPerson);
  const updatePerson = useGraphStore((s) => s.updatePerson);
  const customGroups = useGraphStore((s) => s.customGroups);
  const persons = useGraphStore((s) => s.persons);

  const isEdit = formModal === 'editPerson';
  const isOpen = formModal === 'addPerson' || formModal === 'editPerson';

  // Check if "me" is already taken
  const yoTaken = persons.some((p) => p.group === 'me' && (!isEdit || p.id !== editingItem?.id));

  const [form, setForm] = useState({
    name: '',
    group: 'work',
    metAt: '',
    metContext: '',
    notes: '',
    tags: '',
    avatar: '',
  });

  useEffect(() => {
    if (isEdit && editingItem) {
      setForm({
        name: editingItem.name || '',
        group: editingItem.group || 'work',
        metAt: editingItem.metAt || '',
        metContext: editingItem.metContext || '',
        notes: editingItem.notes || '',
        tags: (editingItem.tags || []).join(', '),
        avatar: editingItem.avatar || '',
      });
    } else {
      setForm({ name: '', group: 'work', metAt: '', metContext: '', notes: '', tags: '', avatar: '' });
    }
  }, [isEdit, editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      avatar: form.avatar || null,
      socials: isEdit && editingItem ? editingItem.socials : {},
    };
    if (isEdit && editingItem) {
      updatePerson(editingItem.id, data);
    } else {
      addPerson(data);
    }
    closeForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Person' : 'Add Person'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit this person\'s details.' : 'Add a new person to your network.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Group</Label>
              <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(customGroups).map(([key, val]) => {
                    if (key === 'me' && yoTaken && form.group !== 'me') return null;
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: val.color }}
                          />
                          {val.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="metAt">{form.group === 'me' ? 'Date of birth' : 'Date met'}</Label>
              <Input
                id="metAt"
                type="date"
                value={form.metAt}
                onChange={(e) => setForm({ ...form, metAt: e.target.value })}
              />
            </div>
          </div>

          {form.group !== 'me' && (
            <div className="space-y-1.5">
              <Label htmlFor="metContext">Where/how did you meet?</Label>
              <Input
                id="metContext"
                value={form.metContext}
                onChange={(e) => setForm({ ...form, metContext: e.target.value })}
                placeholder="e.g. UX Conference Lima"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. backend, startup, AI"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes about this person..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px] resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm">{isEdit ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RelationForm() {
  const formModal = useGraphStore((s) => s.formModal);
  const editingItem = useGraphStore((s) => s.editingItem);
  const closeForm = useGraphStore((s) => s.closeForm);
  const addRelation = useGraphStore((s) => s.addRelation);
  const updateRelation = useGraphStore((s) => s.updateRelation);
  const persons = useGraphStore((s) => s.persons);
  const customRelationTypes = useGraphStore((s) => s.customRelationTypes);

  const isEdit = formModal === 'editRelation';
  const isOpen = formModal === 'addRelation' || formModal === 'editRelation';

  const [form, setForm] = useState({
    source: '',
    target: '',
    type: 'acquaintance',
    label: '',
    metDate: '',
    metContext: '',
    strength: 2,
    notes: '',
  });

  useEffect(() => {
    if (isEdit && editingItem) {
      setForm({
        source: editingItem.source || '',
        target: editingItem.target || '',
        type: editingItem.type || 'acquaintance',
        label: editingItem.label || '',
        metDate: editingItem.metDate || '',
        metContext: editingItem.metContext || '',
        strength: editingItem.strength || 2,
        notes: editingItem.notes || '',
      });
    } else if (editingItem?.prefilledSource) {
      setForm({ source: editingItem.prefilledSource, target: '', type: 'acquaintance', label: '', metDate: '', metContext: '', strength: 2, notes: '' });
    } else {
      setForm({ source: '', target: '', type: 'acquaintance', label: '', metDate: '', metContext: '', strength: 2, notes: '' });
    }
  }, [isEdit, editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.source || !form.target || form.source === form.target) {
      alert('Please select two different people');
      return;
    }
    const data = {
      ...form,
      strength: Number(form.strength),
      evolution: isEdit && editingItem ? editingItem.evolution : [],
    };
    if (isEdit && editingItem) {
      updateRelation(editingItem.id, data);
    } else {
      addRelation(data);
    }
    closeForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Relation' : 'Add Relation'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit this connection.' : 'Connect two people in your network.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Person A *</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Person B *</Label>
              <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Relation type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(customRelationTypes).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: val.color }}
                        />
                        {val.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Strength (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={form.strength}
                onChange={(e) => setForm({ ...form, strength: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="relLabel">Label</Label>
            <Input
              id="relLabel"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Same team at Oxide"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="relDate">Date</Label>
              <Input
                id="relDate"
                type="date"
                value={form.metDate}
                onChange={(e) => setForm({ ...form, metDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="relContext">Context</Label>
              <Input
                id="relContext"
                value={form.metContext}
                onChange={(e) => setForm({ ...form, metContext: e.target.value })}
                placeholder="How did they meet?"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="relNotes">Notes</Label>
            <textarea
              id="relNotes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px] resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm">{isEdit ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FormModals() {
  return (
    <>
      <PersonForm />
      <RelationForm />
    </>
  );
}
