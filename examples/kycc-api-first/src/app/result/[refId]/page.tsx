import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Archive,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  fetchKYCCStatus,
  generateKYCCDashboardLinkToRefId,
  generateKYCCDashboardLinkToRecordId,
} from "./actions";
import { Suspense } from "react";

const statusExplanations = {
  incomplete: "Initial state: Waiting for Blockpass to perform checks.",
  waiting: "Blockpass checks are complete; awaiting operator review.",
  inreview: "An operator is currently reviewing the record.",
  approve: "The record has been approved by an operator.",
  blocked:
    "The record has been blocked by an operator. Contact for more information.",
  rejected:
    "An operator has rejected certain attributes; resubmission is required.",
  review_requested:
    "An operator has requested a new submission for data re-verification.",
} as const;

function formatDate(date: any) {
  if (!date) return null;
  return new Date(date).toLocaleString();
}

async function StatusContent({ refId }: { refId: string }) {
  const blockpassStatus = await fetchKYCCStatus(refId);

  if (blockpassStatus.status === "error") {
    const errorMessage = blockpassStatus.message as string;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Error Loading Status</p>
        </div>
        <p className="text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  const { data } = blockpassStatus;
  const statusExplanation = statusExplanations[data.status];
  const recordDashboardLink = await generateKYCCDashboardLinkToRecordId(
    data.recordId
  );

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg space-y-4">
        <div>
          <p className="font-medium">Current Status:</p>
          <p className="font-medium capitalize">{data.status}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {statusExplanation}
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Record Information:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-muted-foreground">Record ID:</p>
            <div className="flex items-center gap-2">
              <p className="font-mono">{data.recordId}</p>
              <a
                href={recordDashboardLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
                title="View in KYCC Dashboard"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="text-muted-foreground">Reference ID:</p>
            <p className="font-mono">{data.refId}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Timeline:</p>
          <div className="space-y-1 text-sm">
            {data.waitingDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Waiting since: {formatDate(data.waitingDate)}</span>
              </div>
            )}
            {data.inreviewDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>In review since: {formatDate(data.inreviewDate)}</span>
              </div>
            )}
            {data.approvedDate && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Approved on: {formatDate(data.approvedDate)}</span>
              </div>
            )}
            {data.reviewRequestedDate && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>
                  Review requested on: {formatDate(data.reviewRequestedDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {data.willArchiveAtDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Archive className="h-4 w-4" />
            <span>
              Will be archived on: {formatDate(data.willArchiveAtDate)}
            </span>
          </div>
        )}

        {data.isArchived && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Archive className="h-4 w-4" />
            <span>This record has been archived</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function ResultPage({
  params,
}: {
  params: { refId: string };
}) {
  const { refId } = await params;
  const dashboardLink = await generateKYCCDashboardLinkToRefId(refId);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Verification Submitted Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your identity verification has been submitted successfully. We
              will review your submission and get back to you soon.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Reference ID:</p>
              <p className="font-mono text-sm">{refId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please keep this reference ID for future correspondence.
            </p>
            <Suspense
              fallback={
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              }
            >
              <StatusContent refId={refId} />
            </Suspense>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                You can view your verification result in the KYCC Dashboard (if
                you have sufficient permissions).
              </p>
              <a
                href={dashboardLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Open KYCC Dashboard
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline-block"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                For more information, visit{" "}
                <a
                  href="https://docs.blockpass.org/docs/connect/KYCC-Dashboard-Introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  KYCC Dashboard Documentation
                </a>
              </p>
              <div className="mt-4 pt-4 border-t">
                <a
                  href="/"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Submit a new verification record
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
