import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const InvoiceDialog = ({ isOpen, onClose, selectedOrder }: any) => {
  if (!selectedOrder?.invoice) return null;

  const { invoice } = selectedOrder;

  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatCurrencyWithoutSymbol = (amount: any) => {
    if (!amount && amount !== 0) return "";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const toWords = (num: any) => {
    if (num === 0) return "zero";
    return `${Math.floor(num)} rupees`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[70vw]  max-h-[90vh] w-full h-full p-0 gap-0 bg-gray-100 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
          <DialogTitle className="text-lg font-semibold">
            Tax Invoice
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Invoice Content */}
        <div
          className="flex-1 overflow-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="bg-white border-2 border-black" id="invoice-content">
            {/* GSTIN and Original Copy Header */}
            <div className="flex justify-between px-2 py-2 text-xs font-bold">
              <span>GSTIN : 07AESPG4279D2Z9</span>
              <span>Original Copy</span>
            </div>

            {/* Tax Invoice Header */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold border-b border-black inline-block px-4 py-1">
                TAX INVOICE
              </h1>
            </div>

            {/* Company Header */}
            <div className="text-center px-6 py-4 border-b border-black">
              <h2 className="text-2xl sm:text-3xl font-bold">
                SARAL CHEMICALS
              </h2>
              <p className="text-sm mt-1">A-262/2, PHASE-1</p>
              <p className="text-sm">ASHOK VIHAR, DELHI 110052</p>
              <p className="text-sm mt-1">email : saraldyes@gmail.com</p>
              <p className="text-sm font-bold">
                Mob.- +91 9810024522, 9810166261, Tel : 41501969, 23913616
              </p>
            </div>

            {/* Party and Invoice Details */}
            <div className="flex flex-col lg:flex-row border-b border-black min-h-[180px]">
              <div className="flex-1 p-3 border-b lg:border-b-0 lg:border-r border-black">
                <h3 className="text-sm font-bold mb-2">Party Details :</h3>
                <p className="text-sm font-bold mb-1">{invoice.partyName}</p>
                <p className="text-xs mb-3">{invoice.partyAddress}</p>

                <div className="space-y-1 text-xs">
                  <div className="flex">
                    <span className="w-20">Transport</span>
                    <span className="mr-2">:</span>
                    <span>{invoice.transport}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20">GSTIN / UIN</span>
                    <span className="mr-2">:</span>
                    <span className="break-all">{invoice.gstinBuyer}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20">P.O. No.</span>
                    <span className="mr-2">:</span>
                    <span></span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-3">
                <div className="space-y-1 text-xs">
                  <div className="flex">
                    <span className="w-24">Invoice No</span>
                    <span className="mr-2">:</span>
                    <span>{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24">Dated</span>
                    <span className="mr-2">:</span>
                    <span>{formatDate(invoice.date)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24">Place of Supply</span>
                    <span className="mr-2">:</span>
                    <span>Haryana (06)</span>
                  </div>
                  <div className="flex">
                    <span className="w-24">Reverse Charge</span>
                    <span className="mr-2">:</span>
                    <span>N</span>
                  </div>
                  <div className="flex">
                    <span className="w-24">GR/RR No.</span>
                    <span className="mr-2">:</span>
                    <span></span>
                  </div>
                  <div className="flex">
                    <span className="w-24">Vehicle No.</span>
                    <span className="mr-2">:</span>
                    <span></span>
                  </div>
                  <div className="flex">
                    <span className="w-24">E-Way Bill No.</span>
                    <span className="mr-2">:</span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* IRN Details */}
            <div className="border-b border-black py-2 px-2">
              <div className="mb-1">
                <span className="text-xs font-medium mr-2">IRN:</span>
                <span className="text-xs break-all">{invoice.irn}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="mb-1 sm:mb-0">
                  <span className="text-xs font-medium mr-2">Ack. No.:</span>
                  <span className="text-xs">{invoice.ackNo}</span>
                </div>
                <div>
                  <span className="text-xs font-medium mr-2">Ack. Date:</span>
                  <span className="text-xs">{formatDate(invoice.ackDate)}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-black overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="flex border-b border-black bg-gray-50">
                  <div className="flex-[0.4] p-2 border-r border-black text-xs font-bold text-center">
                    S.N.
                  </div>
                  <div className="flex-[2] p-2 border-r border-black text-xs font-bold text-center">
                    Description of Goods
                  </div>
                  <div className="flex-[0.8] p-2 border-r border-black text-xs font-bold text-center">
                    HSN/SAC Code
                  </div>
                  <div className="flex-[0.6] p-2 border-r border-black text-xs font-bold text-center">
                    Qty.
                  </div>
                  <div className="flex-[0.5] p-2 border-r border-black text-xs font-bold text-center">
                    Unit
                  </div>
                  <div className="flex-[0.7] p-2 border-r border-black text-xs font-bold text-center">
                    List Price
                  </div>
                  <div className="flex-[0.7] p-2 border-r border-black text-xs font-bold text-center">
                    Discount
                  </div>
                  <div className="flex-[0.6] p-2 border-r border-black text-xs font-bold text-center">
                    IGST Rate
                  </div>
                  <div className="flex-[0.8] p-2 border-r border-black text-xs font-bold text-center">
                    IGST Amount
                  </div>
                  <div className="flex-[1.46] p-2 text-xs font-bold text-center">
                    Amount(Rs.)
                  </div>
                </div>

                {invoice.items?.map((item: any, index: any) => (
                  <div key={index} className="flex min-h-[40px]">
                    <div className="flex-[0.4] p-2 border-r border-black text-xs text-center">
                      {index + 1}.
                    </div>
                    <div className="flex-[2] p-2 border-r border-black text-xs text-left">
                      {item.name}
                    </div>
                    <div className="flex-[0.8] p-2 border-r border-black text-xs text-center">
                      {item.hsn}
                    </div>
                    <div className="flex-[0.6] p-2 border-r border-black text-xs text-center">
                      {item.quantity === 0 ? "--" : item.quantity?.toFixed(3)}
                    </div>
                    <div className="flex-[0.5] p-2 border-r border-black text-xs text-center">
                      {item.unit}
                    </div>
                    <div className="flex-[0.7] p-2 border-r border-black text-xs text-center">
                      {item.unitPrice}
                    </div>
                    <div className="flex-[0.7] p-2 border-r border-black text-xs text-center">
                      {item.discount?.toFixed(2)} %
                    </div>
                    <div className="flex-[0.6] p-2 border-r border-black text-xs text-center">
                      --
                    </div>
                    <div className="flex-[0.8] p-2 border-r border-black text-xs text-center">
                      --
                    </div>
                    <div className="flex-[1.5] p-2 text-xs text-center">
                      {formatCurrencyWithoutSymbol(item.amount)}
                    </div>
                  </div>
                ))}

                {/* Total Row */}
                <div className="flex border-t border-black bg-gray-50">
                  <div className="flex-[7.6] p-2 text-xs font-bold text-right">
                    Total:
                  </div>
                  <div className="flex-[1.5] p-2 text-xs font-bold text-center">
                    {formatCurrencyWithoutSymbol(invoice.totalAmount)}
                  </div>
                </div>

                {/* Rounded Off Row */}
                <div className="flex">
                  <div className="flex-[7.6] p-2 text-xs text-right">
                    Less : Rounded off (-)
                  </div>
                  <div className="flex-[1.5] p-2 text-xs text-center">
                    {formatCurrencyWithoutSymbol(Math.abs(invoice.roundOff))}
                  </div>
                </div>

                {/* Grand Total Row */}
                <div className="flex border-t border-black bg-gray-100">
                  <div className="flex-[2.4] p-2 text-xs font-bold text-left">
                    Grand Total
                  </div>
                  <div className="flex-[1.5] p-2 text-xs font-bold text-center">
                    {invoice.totalQuantity} Units
                  </div>
                  <div className="flex-[5.8] p-2 text-xs"></div>
                  <div className="flex-[1.7] p-2 text-xs font-bold text-center">
                    {formatCurrencyWithoutSymbol(invoice.grandTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Summary Table */}
            <div className="ml-4 mt-4 mb-4 overflow-x-auto">
              <div className="w-64 min-w-[250px]">
                <div className="flex bg-gray-50">
                  <div className="flex-1 p-2 text-xs font-bold text-center">
                    Tax Rate
                  </div>
                  <div className="flex-[1.2] p-2 text-xs font-bold text-center">
                    Taxable Amt.
                  </div>
                  <div className="flex-[1.2] p-2 text-xs font-bold text-center">
                    IGST Amt.
                  </div>
                  <div className="flex-[1.2] p-2 text-xs font-bold text-center">
                    Total Tax
                  </div>
                </div>

                {Object.entries(invoice.taxBreakdown || {}).map(
                  ([rate, tax], index) => (
                    <div key={index} className="flex border-t border-black">
                      <div className="flex-1 p-2 text-xs text-center">
                        {rate}
                      </div>
                      <div className="flex-[1.2] p-2 text-xs text-center">
                        {formatCurrencyWithoutSymbol(
                          (tax as { taxableAmount: number; taxAmount: number })
                            .taxableAmount -
                            (
                              tax as {
                                taxableAmount: number;
                                taxAmount: number;
                              }
                            ).taxAmount
                        )}
                      </div>
                      <div className="flex-[1.2] p-2 text-xs text-center">
                        {formatCurrencyWithoutSymbol(
                          (tax as { taxAmount: number }).taxAmount
                        )}
                      </div>
                      <div className="flex-[1.2] p-2 text-xs text-center">
                        {formatCurrencyWithoutSymbol(
                          (tax as { taxAmount: number }).taxAmount
                        )}
                      </div>
                    </div>
                  )
                )}

                <div className="flex border-t border-b border-black bg-gray-50">
                  <div className="flex-1 p-2 text-xs font-bold text-center">
                    Total
                  </div>
                  <div className="flex-[1.2] p-2 text-xs font-bold text-center">
                    {formatCurrencyWithoutSymbol(invoice.totalTaxableAmount)}
                  </div>
                  <div className="flex-[1.2] p-2 text-xs font-bold text-center">
                    {formatCurrencyWithoutSymbol(invoice.totalTax)}
                  </div>
                  <div className="flex-[1.2] p-2 text-xs font-bold text-center">
                    {formatCurrencyWithoutSymbol(invoice.totalTax)}
                  </div>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="p-6">
              <p className="text-sm font-bold">
                Rupees{" "}
                {toWords(invoice.totalAmount).charAt(0).toUpperCase() +
                  toWords(invoice.totalAmount).slice(1)}{" "}
                Only
              </p>
            </div>

            {/* Declaration */}
            <div className="text-center border-t border-black py-4">
              <h3 className="text-sm font-bold border-b border-black inline-block px-4 mb-2">
                Declaration
              </h3>
              <p className="text-sm font-semibold">
                MSME NO. UDYAM-DL-03-0015844
              </p>
            </div>

            {/* Bank Details */}
            <div className="flex flex-col sm:flex-row border-t border-black p-4">
              <h3 className="text-sm font-bold mr-4 mb-2 sm:mb-0">
                Bank Details :
              </h3>
              <div>
                <p className="text-sm font-medium">
                  HDFC BANK A/C NO. 50200027518030
                </p>
                <p className="text-sm font-medium">IFSC CODE: HDFC0000158</p>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex flex-col lg:flex-row border-t border-black min-h-[200px]">
              <div className="flex-[1.2] p-4 border-b lg:border-b-0 lg:border-r border-black">
                <h3 className="text-sm font-bold mb-2">Terms & Conditions :</h3>
                <div className="text-xs space-y-1">
                  <p>E.& O.E.</p>
                  <p>1. Goods once sold will not be taken back.</p>
                  <p>2. Interest @ 18% p.a. will be charged if the payment</p>
                  <p>is not made within the 45 days.</p>
                  <p>3. Subject to 'Delhi' Jurisdiction only.</p>
                </div>
              </div>

              <div className="flex-[0.7] p-6 border-b lg:border-b-0 lg:border-r border-black text-center">
                <p className="text-xs mb-4">E-Invoice QR Code</p>
                {invoice.qrCodeImage && (
                  <img
                    src={invoice.qrCodeImage}
                    alt="QR Code"
                    className="w-16 h-16 border border-black mx-auto"
                  />
                )}
              </div>

              <div className="flex-[1.8] flex flex-col">
                <div className="border-b border-black p-4">
                  <p className="text-xs">Receiver's Signature :</p>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center p-4">
                  <p className="text-xs mb-2">for SARAL CHEMICALS</p>
                  <div className="w-full h-px bg-black my-8"></div>
                  <p className="text-xs">Authorised Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;
