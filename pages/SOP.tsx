
import React, { useState } from 'react';
import { SOPItem } from '../types';
import { BookOpen, FloppyDisk, Trash } from '@phosphor-icons/react';
import { Button, Card, Modal, Toast } from '../components/ui';
import { useVanguard } from '../context/VanguardContext';

export const SOPModule = () => {
    const { sops, addSOP, updateSOP, deleteSOP } = useVanguard();
    const [selectedDoc, setSelectedDoc] = useState<Partial<SOPItem> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('Geral');
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const categories = ['Todos', 'Onboarding', 'Vendas', 'Técnico', 'Design', 'Administrativo', 'Geral'];

    const filteredSops = sops.filter(doc => selectedCategory === 'Todos' || doc.category === selectedCategory);

    const handleEdit = (doc: SOPItem) => {
        setSelectedDoc(doc);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedDoc({
            category: 'Geral',
            content: ''
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (selectedDoc?.id) {
            updateSOP({ ...selectedDoc, lastUpdated: 'Agora' } as SOPItem);
            setToast({ msg: 'Documento atualizado!', type: 'success' });
        } else {
            const newDoc = {
                ...selectedDoc,
                id: `doc-${Date.now()}`,
                lastUpdated: 'Agora',
                title: selectedDoc?.title || 'Novo Documento'
            } as SOPItem;
            addSOP(newDoc);
            setToast({ msg: 'Documento criado!', type: 'success' });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedDoc?.id) {
            deleteSOP(selectedDoc.id);
            setToast({ msg: 'Documento excluído.', type: 'success' });
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDoc?.title || "Novo Documento"} size="lg">
                <div className="p-6 h-[70vh] flex flex-col">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                            <input className="w-full border p-2 rounded mt-1 font-bold text-lg" value={selectedDoc?.title || ''} onChange={e => setSelectedDoc({ ...selectedDoc, title: e.target.value })} placeholder="Título do SOP" />
                        </div>
                        <div className="w-1/3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                            <select className="w-full border p-2 rounded mt-1 bg-white" value={selectedDoc?.category || 'Geral'} onChange={e => setSelectedDoc({ ...selectedDoc, category: e.target.value as any })}>
                                {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Conteúdo</label>
                        <textarea
                            className="flex-1 w-full border border-gray-200 rounded-lg p-4 resize-none focus:ring-2 focus:ring-gray-200 outline-none leading-relaxed font-mono text-sm"
                            value={selectedDoc?.content || ''}
                            onChange={e => setSelectedDoc({ ...selectedDoc, content: e.target.value })}
                            placeholder="Escreva o processo aqui..."
                        ></textarea>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        {selectedDoc?.id ? (
                            <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded flex items-center gap-2 text-sm font-bold">
                                <Trash size={16} /> Excluir
                            </button>
                        ) : <div></div>}

                        <button onClick={handleSave} className="bg-vblack text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800">
                            <FloppyDisk size={18} /> Salvar Documento
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-vblack">Processos & SOP</h2>
                    <p className="text-sm text-gray-500">Base de conhecimento interna da Vanguarda.</p>
                </div>
                <Button onClick={handleCreate}>+ Novo Documento</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-semibold mb-3 text-sm text-gray-400 uppercase">Categorias</h3>
                    <ul className="space-y-1">
                        {categories.map((cat, i) => (
                            <li
                                key={i}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-sm px-3 py-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${selectedCategory === cat ? 'bg-vblack text-white font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <BookOpen size={14} className={selectedCategory === cat ? 'text-white' : 'text-gray-400'} />
                                {cat}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSops.map(doc => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <div className="flex items-start gap-3 h-full" onClick={() => handleEdit(doc)}>
                                <div className="mt-1 text-vred bg-red-50 p-2 rounded-lg">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-vblack">{doc.title}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{doc.category}</span>
                                        <span className="text-xs text-gray-400 mt-0.5">Atualizado: {doc.lastUpdated}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">{doc.content || 'Sem conteúdo...'}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {filteredSops.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            Nenhum documento encontrado nesta categoria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
