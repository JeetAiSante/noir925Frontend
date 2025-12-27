import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Mail, Loader2, Printer, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';
import QRCode from 'qrcode';

interface ShippingAddress {
  full_name?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  size?: string;
  variant?: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost?: number;
  discount?: number;
  tax?: number;
  total: number;
  payment_method?: string;
  payment_status?: string;
  shipping_address: ShippingAddress;
  notes?: string;
}

interface SiteContact {
  company_name?: string;
  company_logo?: string;
  company_signature?: string;
  invoice_prefix?: string;
  address?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  whatsapp?: string;
}

interface InvoiceGeneratorProps {
  order: Order;
  orderItems: OrderItem[];
  siteContact: SiteContact | null;
  customerEmail?: string;
  onEmailSent?: () => void;
}

const InvoiceGenerator = ({ order, orderItems, siteContact, customerEmail, onEmailSent }: InvoiceGeneratorProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { formatPrice } = useCurrency();
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [order]);

  const generateQRCode = async () => {
    try {
      const trackingUrl = `${window.location.origin}/track-order?order=${order.order_number}`;
      const qrData = await QRCode.toDataURL(trackingUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff',
        },
      });
      setQrCodeDataUrl(qrData);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const invoiceNumber = `${siteContact?.invoice_prefix || 'INV-'}${order.order_number}`;

  const generateInvoiceHTML = () => {
    const shippingAddress = order.shipping_address;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; background: #fff; }
    .invoice-container { max-width: 800px; margin: 0 auto; padding: 30px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 25px; }
    .company-info { flex: 1; }
    .company-logo { max-height: 60px; margin-bottom: 10px; }
    .company-name { font-size: 28px; font-weight: 700; color: #D4AF37; letter-spacing: 2px; margin-bottom: 5px; }
    .company-tagline { font-size: 11px; color: #666; letter-spacing: 1px; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 24px; font-weight: 600; color: #333; margin-bottom: 10px; }
    .invoice-number { font-size: 14px; color: #D4AF37; font-weight: 600; }
    .invoice-date { font-size: 12px; color: #666; margin-top: 5px; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 40px; }
    .address-block { flex: 1; }
    .address-title { font-size: 12px; font-weight: 600; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .address-content { line-height: 1.6; }
    .address-content p { margin: 3px 0; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .items-table th { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; padding: 12px 15px; text-align: left; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .items-table th:last-child { text-align: right; }
    .items-table td { padding: 15px; border-bottom: 1px solid #eee; vertical-align: middle; }
    .items-table td:last-child { text-align: right; font-weight: 500; }
    .items-table tr:hover { background: #fafafa; }
    .item-image { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 12px; border: 1px solid #eee; }
    .item-details { display: flex; align-items: center; }
    .item-name { font-weight: 500; color: #333; }
    .item-meta { font-size: 11px; color: #888; margin-top: 2px; }
    .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
    .totals-table { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .totals-row.discount { color: #16a34a; }
    .totals-row.grand-total { font-size: 16px; font-weight: 700; border-top: 2px solid #D4AF37; border-bottom: none; padding-top: 15px; margin-top: 5px; }
    .qr-section { display: flex; justify-content: space-between; align-items: flex-start; background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; }
    .qr-code { text-align: center; }
    .qr-code img { width: 100px; height: 100px; border: 1px solid #eee; border-radius: 8px; padding: 5px; background: #fff; }
    .qr-text { font-size: 10px; color: #888; margin-top: 8px; }
    .social-links { flex: 1; margin-left: 30px; }
    .social-title { font-size: 11px; font-weight: 600; color: #333; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .social-icons { display: flex; gap: 15px; flex-wrap: wrap; }
    .social-icons a { color: #666; font-size: 11px; text-decoration: none; }
    .social-icons a:hover { color: #D4AF37; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; }
    .footer-text { font-size: 11px; color: #888; margin-bottom: 10px; }
    .signature { margin-top: 20px; text-align: right; }
    .signature img { max-height: 50px; }
    .signature-text { font-size: 11px; color: #888; margin-top: 5px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-processing { background: #dbeafe; color: #2563eb; }
    .status-shipped { background: #e9d5ff; color: #9333ea; }
    .status-delivered { background: #dcfce7; color: #16a34a; }
    .status-cancelled { background: #fee2e2; color: #dc2626; }
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .invoice-container { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        ${siteContact?.company_logo ? `<img src="${siteContact.company_logo}" alt="${siteContact?.company_name || 'NOIR925'}" class="company-logo" />` : ''}
        <div class="company-name">${siteContact?.company_name || 'NOIR925'}</div>
        <div class="company-tagline">Premium 925 Sterling Silver Jewellery</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoiceNumber}</div>
        <div class="invoice-date">${orderDate}</div>
        <div style="margin-top: 10px;">
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <div class="address-title">Bill To</div>
        <div class="address-content">
          <p><strong>${shippingAddress?.full_name || 'N/A'}</strong></p>
          <p>${shippingAddress?.address_line1 || ''}</p>
          ${shippingAddress?.address_line2 ? `<p>${shippingAddress.address_line2}</p>` : ''}
          <p>${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} ${shippingAddress?.postal_code || ''}</p>
          <p>${shippingAddress?.country || 'India'}</p>
          <p>📞 ${shippingAddress?.phone || ''}</p>
          ${shippingAddress?.email ? `<p>✉️ ${shippingAddress.email}</p>` : ''}
        </div>
      </div>
      <div class="address-block">
        <div class="address-title">From</div>
        <div class="address-content">
          <p><strong>${siteContact?.company_name || 'NOIR925'}</strong></p>
          <p>${siteContact?.address || ''}</p>
          <p>📞 ${siteContact?.phone || ''}</p>
          <p>✉️ ${siteContact?.email || ''}</p>
          ${siteContact?.gst_number ? `<p><strong>GSTIN:</strong> ${siteContact.gst_number}</p>` : ''}
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%;">Product</th>
          <th style="width: 15%; text-align: center;">Qty</th>
          <th style="width: 17%; text-align: right;">Price</th>
          <th style="width: 18%; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${orderItems.map(item => `
          <tr>
            <td>
              <div class="item-details">
                ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" class="item-image" />` : ''}
                <div>
                  <div class="item-name">${item.product_name}</div>
                  ${item.size ? `<div class="item-meta">Size: ${item.size}</div>` : ''}
                  ${item.variant ? `<div class="item-meta">Variant: ${item.variant}</div>` : ''}
                </div>
              </div>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatPrice(item.price)}</td>
            <td style="text-align: right;">${formatPrice(item.price * item.quantity)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatPrice(order.subtotal)}</span>
        </div>
        ${(order.shipping_cost ?? 0) > 0 ? `
          <div class="totals-row">
            <span>Shipping</span>
            <span>${formatPrice(order.shipping_cost || 0)}</span>
          </div>
        ` : ''}
        ${(order.discount ?? 0) > 0 ? `
          <div class="totals-row discount">
            <span>Discount</span>
            <span>-${formatPrice(order.discount || 0)}</span>
          </div>
        ` : ''}
        ${(order.tax ?? 0) > 0 ? `
          <div class="totals-row">
            <span>Tax/GST</span>
            <span>${formatPrice(order.tax || 0)}</span>
          </div>
        ` : ''}
        <div class="totals-row grand-total">
          <span>Grand Total</span>
          <span>${formatPrice(order.total)}</span>
        </div>
      </div>
    </div>

    <div class="qr-section">
      <div class="qr-code">
        ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="Order QR Code" />` : '<div style="width:100px;height:100px;background:#eee;border-radius:8px;"></div>'}
        <div class="qr-text">Scan to track order</div>
      </div>
      <div class="social-links">
        <div class="social-title">Connect With Us</div>
        <div class="social-icons">
          ${siteContact?.instagram_url ? `<a href="${siteContact.instagram_url}" target="_blank">📸 Instagram</a>` : ''}
          ${siteContact?.facebook_url ? `<a href="${siteContact.facebook_url}" target="_blank">📘 Facebook</a>` : ''}
          ${siteContact?.twitter_url ? `<a href="${siteContact.twitter_url}" target="_blank">🐦 Twitter</a>` : ''}
          ${siteContact?.whatsapp ? `<a href="https://wa.me/${siteContact.whatsapp.replace(/\D/g, '')}" target="_blank">💬 WhatsApp</a>` : ''}
        </div>
        <div style="margin-top: 15px; font-size: 11px; color: #666;">
          <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
          <p><strong>Payment Status:</strong> ${order.payment_status || 'N/A'}</p>
        </div>
      </div>
    </div>

    ${siteContact?.company_signature ? `
      <div class="signature">
        <img src="${siteContact.company_signature}" alt="Authorized Signature" />
        <div class="signature-text">Authorized Signature</div>
      </div>
    ` : ''}

    <div class="footer">
      <div class="footer-text">
        Thank you for shopping with ${siteContact?.company_name || 'NOIR925'}!
      </div>
      <div class="footer-text">
        For queries: ${siteContact?.email || 'support@noir925.com'} | ${siteContact?.phone || ''}
      </div>
      <div class="footer-text" style="margin-top: 15px; font-size: 10px; color: #aaa;">
        This is a computer-generated invoice and does not require a physical signature.
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const downloadInvoice = () => {
    const invoiceHTML = generateInvoiceHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const sendInvoiceEmail = async () => {
    if (!customerEmail) {
      toast({
        title: "Error",
        description: "No customer email found",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'invoice',
          data: {
            to: customerEmail,
            subject: `Invoice for Order ${order.order_number} - ${siteContact?.company_name || 'NOIR925'}`,
            html: generateInvoiceHTML(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Invoice sent",
        description: `Invoice emailed to ${customerEmail}`,
      });
      onEmailSent?.();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice email",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={downloadInvoice} className="gap-2">
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
        <Button variant="outline" onClick={downloadInvoice} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={sendInvoiceEmail} disabled={sendingEmail} className="gap-2">
          {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {sendingEmail ? 'Sending...' : 'Email Invoice'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden rounded-lg">
          <div 
            ref={invoiceRef}
            className="bg-white text-black"
            dangerouslySetInnerHTML={{ __html: generateInvoiceHTML() }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceGenerator;