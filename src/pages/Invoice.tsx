import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Invoice() {
  const { orderId } = useParams();
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!orderId) return;
        setLoading(true);
        const res = await orderAPI.getInvoice(orderId);
        setInvoice(res.data);
      } catch (e: any) {
        toast.error('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!orderId) return;
    try {
      setEmailing(true);
      await orderAPI.emailReceipt(orderId);
      toast.success('Receipt emailed (mock)');
    } catch {
      toast.error('Failed to send receipt');
    } finally {
      setEmailing(false);
    }
  };

  const handleDownload = () => {
    if (!invoice) return;
    const { orderNumber, createdAt, customerName, customerEmail, customerPhone, deliveryAddress, paymentMethod, items, breakdown } = invoice;
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Invoice ${orderNumber}</title>
      <style>
        body{font-family: Arial, sans-serif; padding:20px; color:#111}
        h1{margin:0 0 8px}
        .muted{color:#666;font-size:12px}
        .row{display:flex;justify-content:space-between;gap:24px}
        .card{border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0}
        table{width:100%;border-collapse:collapse;font-size:14px}
        th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}
        .right{text-align:right}
      </style></head><body>
      <h1>Invoice</h1>
      <div class="row">
        <div>
          <div class="muted">Order Number</div>
          <div><strong>${orderNumber || ''}</strong></div>
          <div class="muted" style="margin-top:6px">Order Date</div>
          <div><strong>${createdAt ? new Date(createdAt).toLocaleString() : '-'}</strong></div>
        </div>
        <div class="right">
          <div class="muted">Billed To</div>
          <div><strong>${customerName || 'Customer'}</strong></div>
          <div>${customerEmail || ''}</div>
          <div>${customerPhone || ''}</div>
        </div>
      </div>
      <div class="card">
        <div class="muted">Delivery Address</div>
        <div>${deliveryAddress || ''}</div>
      </div>
      <div class="card">
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th class="right">Amount</th></tr>
          </thead>
          <tbody>
            ${(items||[]).map((it:any)=>`<tr><td>${it.name}</td><td>${it.quantity}</td><td>₹${it.price}</td><td class="right">₹${it.price*it.quantity}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="row">
        <div>
          <div class="muted">Payment Method</div>
          <div><strong>${String(paymentMethod||'').toUpperCase()}</strong></div>
        </div>
        <div class="right">
          <div>Subtotal: <strong>₹${breakdown?.subtotal || 0}</strong></div>
          <div>Delivery Fee: <strong>₹${breakdown?.deliveryFee || 0}</strong></div>
          <div>Platform Fee: <strong>₹${breakdown?.platformFee || 0}</strong></div>
          <div>Taxes: <strong>₹${breakdown?.taxes || 0}</strong></div>
          <div style="border-top:1px solid #eee;margin-top:6px;padding-top:6px">Total: <strong>₹${breakdown?.total || 0}</strong></div>
        </div>
      </div>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderNumber || orderId}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return <div className="container mx-auto px-4 py-8">Invoice not found.</div>;
  }

  const { orderNumber, createdAt, customerName, customerEmail, customerPhone, deliveryAddress, paymentMethod, items, breakdown } = invoice;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Invoice</h1>
          <div className="space-x-2 hidden print:hidden">
            <Button variant="outline" onClick={handleEmail} disabled={emailing}>Email Receipt</Button>
            <Button variant="outline" onClick={handleDownload}>Download</Button>
            <Button onClick={handlePrint}>Download PDF</Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Order Number</div>
              <div className="font-semibold">{orderNumber}</div>
              <div className="text-sm text-muted-foreground mt-2">Order Date</div>
              <div className="font-semibold">{createdAt ? new Date(createdAt).toLocaleString() : '-'}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Billed To</div>
              <div className="font-semibold">{customerName || 'Customer'}</div>
              <div className="text-sm">{customerEmail}</div>
              <div className="text-sm">{customerPhone}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-muted-foreground mb-1">Delivery Address</div>
            <div className="text-sm">{deliveryAddress}</div>
          </div>

          <div className="mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((it: any) => (
                  <tr key={(it.itemId||'') + it.name} className="border-b last:border-b-0">
                    <td className="py-2">{it.name}</td>
                    <td className="py-2">{it.quantity}</td>
                    <td className="py-2">₹{it.price}</td>
                    <td className="py-2 text-right">₹{it.price * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Payment Method</div>
              <div className="font-semibold">{String(paymentMethod).toUpperCase()}</div>
            </div>
            <div className="md:text-right space-y-1">
              <div>Subtotal: <span className="font-semibold">₹{breakdown.subtotal}</span></div>
              <div>Delivery Fee: <span className="font-semibold">₹{breakdown.deliveryFee}</span></div>
              <div>Platform Fee: <span className="font-semibold">₹{breakdown.platformFee}</span></div>
              <div>Taxes: <span className="font-semibold">₹{breakdown.taxes}</span></div>
              <div className="border-t pt-2 font-bold">Total: ₹{breakdown.total}</div>
            </div>
          </div>
        </Card>

        <div className="print:hidden">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handlePrint} className="sm:w-auto w-full">Download PDF</Button>
            <Button variant="outline" onClick={handleDownload} className="sm:w-auto w-full">Download</Button>
            <Button variant="outline" onClick={handleEmail} disabled={emailing} className="sm:w-auto w-full">Email Receipt</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
