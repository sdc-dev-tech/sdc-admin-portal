import { CheckCircle, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchOrderById,
  uploadInvoiceByManager,
} from "@/redux/slices/ordersSlice";

const InvoiceUpload = ({
  selectedOrder,
  invoiceUploaded,
  handleFileChange,
  invoiceFile,
  setUploadingInvoice,
  setInvoiceUploaded,
}: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleInvoiceUpload = async () => {
    if (!invoiceFile) return toast.error("Please select an invoice file");

    setUploadingInvoice(true);

    try {
      await dispatch(
        uploadInvoiceByManager({
          orderId: selectedOrder._id,
          file: invoiceFile,
        })
      ).unwrap();
      dispatch(fetchOrderById(selectedOrder._id));

      setInvoiceUploaded(true);
      toast.success("Invoice uploaded successfully!!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload invoice.");
    } finally {
      setUploadingInvoice(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Upload
          </CardTitle>
          <CardDescription>
            Upload invoice before selecting items to fulfill
          </CardDescription>
          <div className="flex">
            <strong>Admin comment:</strong>
            <p className="ml-2">
              {selectedOrder?.invoiceRejectedReason !== ""
                ? selectedOrder?.invoiceRejectedReason.toUpperCase()
                : ""}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {invoiceUploaded ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">
                Invoice uploaded successfully
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: XML
                  </p>
                </div>
              </div>
              {invoiceFile && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Selected: {invoiceFile.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button className="bg-[#3C5D87]" onClick={handleInvoiceUpload}>
          Send to Admin for Approval
        </Button>
      </div>
    </div>
  );
};

export default InvoiceUpload;
