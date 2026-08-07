"use client";

import { useEffect, useState } from "react";
import { buildTree, OrgNode } from "@/lib/buildTree";

type FlatItem = {
  id: string;
  name: string;
  position: string;
  order: number;
  parentId: string | null;
};

export default function StrukturPage() {
  const [items, setItems] = useState<FlatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FlatItem | null>(null);

  const [form, setForm] = useState({
    name: "",
    position: "",
    order: 0,
    parentId: "",
  });

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/admin/struktur");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openAddModal(parentId?: string) {
    setEditing(null);
    setForm({ name: "", position: "", order: 0, parentId: parentId || "" });
    setModalOpen(true);
  }

  function openEditModal(item: FlatItem) {
    setEditing(item);
    setForm({
      name: item.name,
      position: item.position,
      order: item.order,
      parentId: item.parentId || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name,
      position: form.position,
      order: Number(form.order),
      parentId: form.parentId || null,
    };

    if (editing) {
      await fetch(`/api/admin/struktur/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/struktur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setModalOpen(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus data ini? Anggota di bawahnya akan pindah ke level atas.")) return;
    await fetch(`/api/admin/struktur/${id}`, { method: "DELETE" });
    fetchData();
  }

  const tree = buildTree(items);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Struktur Organisasi</h1>
        <button
          onClick={() => openAddModal()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
        >
          + Tambah Ketua Umum / Root
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : tree.length === 0 ? (
        <p className="text-gray-500">Belum ada data struktur organisasi.</p>
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="flex justify-center min-w-max">
            <OrgTree
              nodes={tree}
              onAddChild={openAddModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Edit Anggota" : "Tambah Anggota"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jabatan</label>
                <input
                  required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ketua Umum, Bendahara, dll"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Atasan</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">— Tidak ada (Root / Ketua Umum) —</option>
                  {items
                    .filter((i) => i.id !== editing?.id)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.position})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urutan</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrgTree({
  nodes,
  onAddChild,
  onEdit,
  onDelete,
}: {
  nodes: OrgNode[];
  onAddChild: (parentId: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-8">
      {nodes.map((node) => (
        <div key={node.id} className="flex flex-col items-center">
          <div className="bg-white border-2 border-red-600 rounded-xl px-4 py-3 shadow-sm min-w-[160px] text-center">
            <p className="font-semibold text-gray-900">{node.name}</p>
            <p className="text-sm text-red-600">{node.position}</p>
            <div className="flex justify-center gap-2 mt-2 text-xs">
              <button
                onClick={() => onAddChild(node.id)}
                className="text-yellow-600 hover:underline"
              >
                + Bawahan
              </button>
              <button
                onClick={() => onEdit(node)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(node.id)}
                className="text-gray-500 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>

          {node.children.length > 0 && (
            <>
              <div className="w-px h-6 bg-gray-300" />
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
                <div className="flex gap-8 pt-6">
                  <OrgTree
                    nodes={node.children}
                    onAddChild={onAddChild}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}