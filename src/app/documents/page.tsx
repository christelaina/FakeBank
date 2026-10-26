import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumentUpload } from "@/features/documents/components/DocumentUpload";
import { LabChooseFileLink } from "@/features/lab/components/LabChooseFileLink";
import { listDocuments } from "@/lib/api/documents";
import {
  formatCanadianDate,
  formatFileSize,
} from "@/lib/formatting/currency";
import { getEnvironment } from "@/lib/config/environment";
import { isLabEnabled } from "@/lib/lab/config";
import * as neonDocuments from "@/lib/server/documents";
import { ApiError } from "@/types/api";
import { redirect } from "next/navigation";
import { isAuthRequiredError } from "@/lib/server/auth/session";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  try {
    const documents = getEnvironment().isLiveMode
      ? await neonDocuments.listDocuments()
      : await listDocuments();

    return (
      <div>
        <PageHeader
          title="Documents"
          description="Statement library and document uploads. Uploaded content is stored as data and never executed by this frontend."
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Document library</CardTitle>
              <CardDescription>Mock metadata for fictional customer documents.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-brand-800/60">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Uploaded</th>
                    <th className="px-3 py-3 text-right">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-surface-border/70 last:border-0"
                    >
                      <td className="px-3 py-3 font-medium">{doc.name}</td>
                      <td className="px-3 py-3">{doc.category}</td>
                      <td className="px-3 py-3">
                        {formatCanadianDate(doc.uploadedAt)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatFileSize(doc.sizeBytes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload document</CardTitle>
              <CardDescription>
                PDF, JPEG, or PNG. The file is checked against its content before it is saved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLabEnabled() ? (
                <LabChooseFileLink purpose="document" />
              ) : (
                <DocumentUpload enabled={getEnvironment().isLiveMode} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    if (isAuthRequiredError(error)) redirect("/sign-in");
    return (
      <div>
        <PageHeader title="Documents" />
        <Alert tone="error" title="Unable to load documents">
          {error instanceof ApiError ? error.message : "Unexpected error."}
        </Alert>
      </div>
    );
  }
}
