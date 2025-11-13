import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusCircle, Trash2, Calculator, Percent, Coins, FileText, Tag, Wallet, Truck, Users, RotateCcw, Info, FileSpreadsheet, Save, FolderDown, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCalculatorStore, FoodItem } from '@/stores/calculatorStore';
import { formatCurrency } from '@/lib/utils';
import { Toaster, toast } from '@/components/ui/sonner';
import { exportToPdf, exportToExcel } from '@/lib/exportUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
const MotionTableRow = motion.tr;
export function HomePage() {
  const discountPercentage = useCalculatorStore((s) => s.discountPercentage);
  const maxDiscount = useCalculatorStore((s) => s.maxDiscount);
  const shippingCost = useCalculatorStore((s) => s.shippingCost);
  const numberOfPeople = useCalculatorStore((s) => s.numberOfPeople);
  const items = useCalculatorStore((s) => s.items);
  const savedCalculations = useCalculatorStore((s) => s.savedCalculations);
  const { setDiscountPercentage, setMaxDiscount, setShippingCost, setNumberOfPeople, addItem, removeItem, updateItem, reset, initialize, saveCalculation, loadCalculation, deleteCalculation, renameCalculation } = useCalculatorStore();
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [selectedCalculation, setSelectedCalculation] = useState('');
  useEffect(() => {
    initialize();
  }, [initialize]);
  const handleNumericInput = (setter: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setter(parseInt(value, 10) || 0);
  };
  const handleItemUpdate = (id: string, field: keyof FoodItem, value: string) => {
    if (field === 'name') {
      updateItem(id, field, value);
    } else {
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
      updateItem(id, field, numericValue);
    }
  };
  const handleReset = () => {
    reset();
    setSelectedCalculation('');
    toast.success('Kalkulator berhasil direset!');
  };
  const calculations = useMemo(() => {
    const totalGrossPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const theoreticalDiscount = totalGrossPrice > 0 ? totalGrossPrice * (discountPercentage / 100) : 0;
    const appliedDiscount = totalGrossPrice > 0 ? Math.min(theoreticalDiscount, maxDiscount) : 0;
    const subtotalAfterDiscount = totalGrossPrice - appliedDiscount;
    const totalNetPrice = subtotalAfterDiscount + shippingCost;
    const pricePerPerson = numberOfPeople > 0 ? totalNetPrice / numberOfPeople : 0;
    const itemBreakdown = items.map(item => {
      const itemGrossPrice = item.price * item.quantity;
      const proportion = totalGrossPrice > 0 ? itemGrossPrice / totalGrossPrice : 0;
      const itemDiscount = proportion * appliedDiscount;
      const itemShippingCost = proportion * shippingCost;
      const itemNetPrice = itemGrossPrice - itemDiscount + itemShippingCost;
      const itemNetPricePerQty = item.quantity > 0 ? itemNetPrice / item.quantity : 0;
      return {
        ...item,
        itemGrossPrice,
        itemDiscount,
        itemShippingCost,
        itemNetPrice,
        itemNetPricePerQty,
      };
    });
    return { totalGrossPrice, theoreticalDiscount, appliedDiscount, totalNetPrice, itemBreakdown, pricePerPerson, shippingCost, numberOfPeople };
  }, [items, discountPercentage, maxDiscount, shippingCost, numberOfPeople]);
  const handleExportPdf = () => {
    toast.info('Mengekspor ke PDF...');
    exportToPdf(calculations);
  };
  const handleExportExcel = () => {
    toast.info('Mengekspor ke Excel...');
    exportToExcel(calculations);
  };
  const handleSave = () => {
    if (saveCalculation(saveName)) {
      toast.success(`Perhitungan "${saveName}" berhasil disimpan!`);
      setSaveDialogOpen(false);
      setSaveName('');
      setSelectedCalculation(saveName);
    } else {
      toast.error('Nama perhitungan tidak boleh kosong atau sudah ada.');
    }
  };
  const handleLoad = (name: string) => {
    if (name) {
      loadCalculation(name);
      setSelectedCalculation(name);
      toast.success(`Perhitungan "${name}" berhasil dimuat!`);
    }
  };
  const handleDelete = (name: string) => {
    deleteCalculation(name);
    if (selectedCalculation === name) {
      setSelectedCalculation('');
    }
    toast.success(`Perhitungan "${name}" berhasil dihapus!`);
  };
  const handleRename = () => {
    if (renameCalculation(selectedCalculation, renameName)) {
      toast.success(`Berhasil mengubah nama menjadi "${renameName}"!`);
      setSelectedCalculation(renameName);
      setRenameDialogOpen(false);
    } else {
      toast.error('Nama baru tidak valid atau sudah digunakan.');
    }
  };
  const openRenameDialog = () => {
    if (selectedCalculation) {
      setRenameName(selectedCalculation);
      setRenameDialogOpen(true);
    }
  };
  const savedCalculationKeys = Object.keys(savedCalculations);
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeToggle className="fixed top-4 right-4" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16">
            <div className="text-center mb-12 animate-fade-in relative">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                FairShare Calc
              </h1>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
                Hitung harga makanan setelah diskon & ongkir proporsional, seperti di GoFood atau GrabFood.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="absolute top-0 right-0 -mt-2 sm:mt-0 transition-transform hover:rotate-[-90deg] active:scale-90">
                    <RotateCcw className="w-4 h-4" />
                    <span className="sr-only">Reset Kalkulator</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Anda yakin ingin mereset?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Semua item dan konfigurasi yang belum disimpan akan dihapus. Aksi ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="max-w-3xl mx-auto space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Coins className="w-5 h-5 text-primary" />Konfigurasi Diskon & Ongkir</CardTitle>
                    <CardDescription>Masukkan detail diskon dan ongkos kirim untuk total belanja.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="discount-percentage" className="flex items-center gap-1.5"><Percent className="w-4 h-4" />Persentase Diskon (%)</Label>
                      <Input id="discount-percentage" type="text" value={discountPercentage} onChange={handleNumericInput(setDiscountPercentage)} placeholder="e.g., 50" className="text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-discount" className="flex items-center gap-1.5"><Tag className="w-4 h-4" />Maksimal Diskon (Rp)</Label>
                      <Input id="max-discount" type="text" value={'Rp. ' + maxDiscount.toLocaleString('id-ID')} onChange={handleNumericInput(setMaxDiscount)} placeholder="e.g., 200000" className="text-lg" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="shipping-cost" className="flex items-center gap-1.5"><Truck className="w-4 h-4" />Ongkos Kirim (Rp)</Label>
                      <Input id="shipping-cost" type="text" value={'Rp. ' + shippingCost.toLocaleString('id-ID')} onChange={handleNumericInput(setShippingCost)} placeholder="e.g., 15000" className="text-lg" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />Daftar Makanan</CardTitle>
                    <CardDescription>Masukkan semua item belanja Anda di sini.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="grid grid-cols-12 gap-2 items-center"
                        >
                          <div className="col-span-12 sm:col-span-5">
                            <Label htmlFor={`item-name-${index}`} className="sr-only">Nama Makanan</Label>
                            <Input id={`item-name-${index}`} value={item.name} onChange={(e) => handleItemUpdate(item.id, 'name', e.target.value)} placeholder="Nama Makanan" />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <Label htmlFor={`item-price-${index}`} className="sr-only">Harga</Label>
                            <Input id={`item-price-${index}`} value={'Rp. ' + item.price.toLocaleString('id-ID')} onChange={(e) => handleItemUpdate(item.id, 'price', e.target.value)} placeholder="Harga" />
                          </div>
                          <div className="col-span-4 sm:col-span-2">
                            <Label htmlFor={`item-qty-${index}`} className="sr-only">Jumlah</Label>
                            <Input id={`item-qty-${index}`} type="number" min="1" value={item.quantity} onChange={(e) => handleItemUpdate(item.id, 'quantity', e.target.value)} placeholder="Qty" className="text-center" />
                          </div>
                          <div className="col-span-2 sm:col-span-2 flex justify-end">
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={addItem} className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
                      <PlusCircle className="w-4 h-4 mr-2" /> Tambah Makanan
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FolderDown className="w-5 h-5 text-primary" />Aksi</CardTitle>
                    <CardDescription>Simpan, muat, atau hapus sesi perhitungan Anda.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={() => setSaveDialogOpen(true)} disabled={items.length === 0}>
                      <Save className="w-4 h-4 mr-2" /> Simpan Perhitungan
                    </Button>
                    <div className="flex gap-2">
                      <Select onValueChange={handleLoad} value={selectedCalculation} disabled={savedCalculationKeys.length === 0}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Muat Perhitungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Perhitungan Tersimpan</SelectLabel>
                            {savedCalculationKeys.map(key => (
                              <SelectItem key={key} value={key}>{key}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {selectedCalculation && (
                        <>
                          <Button variant="outline" size="icon" onClick={openRenameDialog}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <X className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Aksi ini akan menghapus perhitungan bernama "{selectedCalculation}" secara permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(selectedCalculation)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              {calculations.itemBreakdown.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" />Hasil Perhitungan</CardTitle>
                      <CardDescription>Rincian harga setelah diskon dan ongkir diterapkan secara proporsional.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama Makanan</TableHead>
                              <TableHead className="text-right">Harga Asli</TableHead>
                              <TableHead className="text-right text-green-600">Diskon</TableHead>
                              <TableHead className="text-right font-semibold">
                                <div className="flex items-center justify-end gap-1">
                                  Harga Akhir
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Harga setelah diskon + ongkir proporsional.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableHead>
                              <TableHead className="text-right">Harga/Porsi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {calculations.itemBreakdown.map(item => (
                                <MotionTableRow
                                  key={item.id}
                                  layout
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <TableCell className="font-medium">{item.name || "Item Tanpa Nama"}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.itemGrossPrice)}</TableCell>
                                  <TableCell className="text-right text-green-600">-{formatCurrency(item.itemDiscount)}</TableCell>
                                  <TableCell className="text-right font-semibold">{formatCurrency(item.itemNetPrice)}</TableCell>
                                  <TableCell className="text-right text-muted-foreground">{formatCurrency(item.itemNetPricePerQty)}</TableCell>
                                </MotionTableRow>
                              ))}
                            </AnimatePresence>
                          </TableBody>
                          <TableFooter>
                            <TableRow className="bg-muted/50">
                              <TableCell colSpan={2} className="font-bold text-lg">Total</TableCell>
                              <TableCell className="text-right font-bold text-lg text-green-600">-{formatCurrency(calculations.appliedDiscount)}</TableCell>
                              <TableCell colSpan={2} className="text-right font-bold text-lg">{formatCurrency(calculations.totalNetPrice)}</TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={handleExportExcel} disabled={calculations.itemBreakdown.length === 0}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> Ekspor Excel
                      </Button>
                      <Button onClick={handleExportPdf} disabled={calculations.itemBreakdown.length === 0}>
                        <FileText className="w-4 h-4 mr-2" /> Ekspor PDF
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" />Ringkasan Total</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-base">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Belanja</span>
                      <span className="font-medium">{formatCurrency(calculations.totalGrossPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <span className="">Total Diskon</span>
                      <span className="font-medium">-{formatCurrency(calculations.appliedDiscount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Ongkos Kirim</span>
                      <span className="font-medium">{formatCurrency(shippingCost)}</span>
                    </div>
                    <hr className="my-2 border-border" />
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total Pembayaran</span>
                      <span>{formatCurrency(calculations.totalNetPrice)}</span>
                    </div>
                    <div className="border-t border-dashed pt-4 mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="split-bill" className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-4 h-4" />Bagi Rata Untuk</Label>
                        <Input id="split-bill" type="text" value={numberOfPeople} onChange={handleNumericInput(setNumberOfPeople)} className="h-8 max-w-[120px] text-right" placeholder="1" />
                      </div>
                      <div className="flex justify-between items-center text-lg font-semibold text-primary">
                        <span>Per Orang</span>
                        <span>{formatCurrency(calculations.pricePerPerson)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
        <footer className="text-center py-8 text-sm text-muted-foreground">
          Built with ❤️ at Cloudflare
        </footer>
        <Toaster richColors />
        <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simpan Perhitungan</DialogTitle>
              <DialogDescription>
                Beri nama untuk sesi perhitungan ini agar mudah diingat nanti.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="save-name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="save-name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="col-span-3"
                  placeholder="Contoh: Makan Siang Kantor"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Batal</Button>
              </DialogClose>
              <Button type="submit" onClick={handleSave}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Nama Perhitungan</DialogTitle>
              <DialogDescription>
                Masukkan nama baru untuk perhitungan "{selectedCalculation}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rename-name" className="text-right">
                  Nama Baru
                </Label>
                <Input
                  id="rename-name"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  className="col-span-3"
                  placeholder="Nama baru"
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Batal</Button>
              </DialogClose>
              <Button type="submit" onClick={handleRename}>Ubah Nama</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}