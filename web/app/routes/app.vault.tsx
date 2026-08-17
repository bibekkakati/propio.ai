import DocumentFormDialog from "@/components/documentformdialog";
import PropertySelector from "@/components/propertyselector";
import ScreenLoader from "@/components/screenloader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useMetaTags from "@/lib/meta";
import { DOCUMENTS_KEY, PROPERTIES_KEY } from "@/querykeys";
import AttachmentService from "@/services/attachment.service";
import DocumentStorageService from "@/services/documentstorage.service";
import PropertyService from "@/services/property.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
    ArrowDownToLine,
    Ellipsis,
    EllipsisVertical,
    Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { MetaArgs, MetaFunction } from "react-router";
import { toast } from "sonner";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "Vault" });
};

export default function Vault() {
    const queryClient = useQueryClient();

    const [selectedProperty, setSelectedProperty] = useState("");
    const [addDialog, setAddDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState("");

    const { data: properties = [], isLoading: propertiesLoading } = useQuery({
        queryKey: [PROPERTIES_KEY],
        queryFn: PropertyService.getProperties,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const { data: documents = [], isLoading: documentsLoading } = useQuery({
        queryKey: [DOCUMENTS_KEY, selectedProperty],
        queryFn: () => DocumentStorageService.getDocuments(selectedProperty),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!selectedProperty && !propertiesLoading,
    });

    const refreshDocuments = () => {
        queryClient.invalidateQueries({
            queryKey: [DOCUMENTS_KEY, selectedProperty],
        });
    };

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocument(documentId);
        setAddDialog(true);
    };

    const handleAddNew = () => {
        setSelectedDocument("");
        setAddDialog(true);
    };

    const handleFileDownload = async (fileId) => {
        toast.info("Downloading file...");
        try {
            const url = await AttachmentService.downloadFile(fileId);

            // open in separate tab
            window.open(url, "_blank");
        } catch (error) {
            toast.error("Failed to download file");
        }
    };

    useEffect(() => {
        if (!properties.length) {
            setSelectedProperty("");
            return;
        }

        const selectedPropertyExists = properties.some(
            (p) => p._id === selectedProperty,
        );

        // if selected property is not in the list, reset
        if (!selectedPropertyExists) {
            setSelectedProperty(properties[0]._id);
        }
    }, [properties]);

    return (
        <div
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            data-testid="vault-page"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Vault</h1>
                </div>

                <div className="flex flex-row items-center gap-3">
                    <Button
                        data-testid="add-document-dashboard-btn"
                        onClick={handleAddNew}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Upload
                    </Button>
                    <PropertySelector
                        properties={properties}
                        value={selectedProperty}
                        onSelect={setSelectedProperty}
                    />
                </div>
            </div>

            <div className="bg-white" data-testid="documents-list">
                {propertiesLoading || documentsLoading ? (
                    <ScreenLoader />
                ) : documents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 rounded-lg border border-gray-200">
                        No documents added yet.
                    </div>
                ) : (
                    <div>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Effective From
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Expiry Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Document
                                        </th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {documents.map((document, index) => (
                                        <motion.tr
                                            key={document._id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.25,
                                                ease: "easeOut",
                                                delay: index * 0.03,
                                            }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {document.documentTitle}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                <Badge
                                                    variant={
                                                        document.documentType
                                                    }
                                                >
                                                    {document.documentType}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {dayjs(
                                                    document.effectiveDate,
                                                ).format("Do MMM YYYY")}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {document.expiryDate
                                                    ? dayjs(
                                                          document.expiryDate,
                                                      ).format("Do MMM YYYY")
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="items-center text-brand p-0"
                                                    onClick={() =>
                                                        handleFileDownload(
                                                            document.attachmentId,
                                                        )
                                                    }
                                                >
                                                    Download
                                                    <ArrowDownToLine className="w-2 h-2 text-brand" />
                                                </Button>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="items-center p-0"
                                                    onClick={() =>
                                                        handleDocumentClick(
                                                            document._id,
                                                        )
                                                    }
                                                >
                                                    <Ellipsis className="w-2 h-2" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Table View */}
                        <div className="md:hidden space-y-3">
                            {documents.map((document, index) => (
                                <motion.div
                                    key={document._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                        delay: index * 0.03,
                                    }}
                                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm active:shadow-md transition-shadow"
                                >
                                    {/* Accent Strip */}
                                    <div className="absolute left-0 top-0 h-full w-1 bg-gray-900/80" />

                                    <div className="p-4">
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-wrap text-gray-700">
                                                    {document.documentTitle}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <Badge
                                                    variant={
                                                        document.documentType
                                                    }
                                                >
                                                    {document.documentType}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Breakdown Grid */}
                                        <div className="mt-4 grid grid-cols-10 gap-2 text-xs">
                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Effective
                                                </p>
                                                <p className="text-gray-900 truncate mt-1">
                                                    {dayjs(
                                                        document.effectiveDate,
                                                    ).format("Do MMM'YY")}
                                                </p>
                                            </div>
                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Expiry
                                                </p>
                                                <p className="text-gray-900 truncate mt-1">
                                                    {document.expiryDate
                                                        ? dayjs(
                                                              document.expiryDate,
                                                          ).format("Do MMM'YY")
                                                        : "-"}
                                                </p>
                                            </div>
                                            <div className="col-span-3 rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                                                <p className="text-[11px] text-gray-400">
                                                    Document
                                                </p>
                                                <p
                                                    className="text-brand font-medium mt-1"
                                                    onClick={() =>
                                                        handleFileDownload(
                                                            document.attachmentId,
                                                        )
                                                    }
                                                >
                                                    View
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleDocumentClick(
                                                        document._id,
                                                    )
                                                }
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Edit document"
                                            >
                                                <EllipsisVertical className="h-4 w-4 text-gray-700" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {addDialog ? (
                <DocumentFormDialog
                    open={addDialog}
                    onOpenChange={setAddDialog}
                    documentId={selectedDocument}
                    propertyId={selectedProperty}
                    onSuccess={() => {
                        refreshDocuments();
                        setSelectedDocument(null);
                    }}
                />
            ) : null}
        </div>
    );
}
