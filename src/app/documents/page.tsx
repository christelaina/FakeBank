import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfilePictureUpload } from "@/features/documents/components/ProfilePictureUpload";
import { listDocuments } from "@/lib/api/documents";
import {
  formatCanadianDate,
  formatFileSize,
} from "@/lib/formatting/currency";
import { ApiError } from "@/types/api";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  try {
    const documents = await listDocuments();

    return (
      <div>
        <PageHeader
          title="Documents"
          description="Statement library and profile picture selection. Uploaded content is never executed by this frontend."
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
              <CardTitle>Profile picture upload</CardTitle>
              <CardDescription>
                Local preview only. Future server validation lives in the isolated API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePictureUpload />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
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
