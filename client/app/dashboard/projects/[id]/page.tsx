"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  approveProjectDraftRequest,
  assignFreelancerRequest,
  createSubmissionRequest,
  getProjectRequest,
  listProjectApplicantsRequest,
  listFreelancersRequest,
  rateSubmissionRequest,
  selectProjectApplicantRequest,
} from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth-store";
import { Button, Card, Input, PageIntro, Pill, ProgressBar, Select, Textarea } from "../../../../components/ui/primitives";

type MilestoneFormState = {
  fileUrl: string;
  notes: string;
};

export default function DashboardProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { token, user, hydrate } = useAuthStore();

  const [project, setProject] = useState<any>(null);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ratingInputs, setRatingInputs] = useState<Record<string, string>>({});
  const [milestoneForms, setMilestoneForms] = useState<Record<string, MilestoneFormState>>({});
  const [validationResult, setValidationResult] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<"LOCKED" | "RELEASED" | "DISPUTED">("LOCKED");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function loadProject() {
    if (!token || !projectId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getProjectRequest(token, projectId);
      setProject(data);

      if (user?.role === "CLIENT" && !data.freelancer) {
        const freelancerData = await listFreelancersRequest({});
        setFreelancers(freelancerData);
        const applicantData = await listProjectApplicantsRequest(token, projectId);
        setApplicants(applicantData);
      } else {
        setApplicants([]);
      }

      const initialForms = (data.milestones ?? []).reduce((acc: Record<string, MilestoneFormState>, milestone: any) => {
        acc[milestone.id] = { fileUrl: "", notes: "" };
        return acc;
      }, {});
      setMilestoneForms(initialForms);

      const initialRatings = (data.milestones ?? []).reduce((acc: Record<string, string>, milestone: any) => {
        const latestSubmission = milestone.submissions?.[0];
        if (latestSubmission?.id) {
          acc[latestSubmission.id] = latestSubmission.clientRating ? String(latestSubmission.clientRating) : "70";
        }
        return acc;
      }, {});
      setRatingInputs(initialRatings);

      if (data.validationReports?.length) {
        setValidationResult(data.validationReports[0]);
        setPaymentStatus(data.validationReports[0].decision === "APPROVED" ? "RELEASED" : "DISPUTED");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProject();
  }, [token, projectId, user?.role]);

  const finalScore = validationResult?.finalScore ?? 0;
  const requirementMatch = Math.min(100, Math.max(0, finalScore + 8));
  const completeness = Math.min(100, Math.max(0, finalScore));
  const qualityMetrics = Math.min(100, Math.max(0, finalScore - 6));

  const canAssign = user?.role === "CLIENT" && !project?.freelancer;
  const canApproveDraft = user?.role === "CLIENT";
  const canSubmit = user?.role === "FREELANCER";

  const milestoneProgress = useMemo(() => {
    if (!project?.milestones?.length) {
      return 0;
    }

    const approved = project.milestones.filter((item: any) => item.status === "APPROVED").length;
    return (approved / project.milestones.length) * 100;
  }, [project]);

  async function onAssignFreelancer() {
    if (!token || !selectedFreelancerId || !projectId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await assignFreelancerRequest(token, projectId, selectedFreelancerId);
      setSelectedFreelancerId("");
      await loadProject();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onApproveDraft() {
    if (!token || !projectId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await approveProjectDraftRequest(token, projectId);
      await loadProject();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onSelectApplicant(applicationId: string) {
    if (!token || !projectId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await selectProjectApplicantRequest(token, projectId, applicationId);
      await loadProject();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onSubmitMilestone(event: FormEvent, milestoneId: string) {
    event.preventDefault();

    if (!token || !projectId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const state = milestoneForms[milestoneId] ?? { fileUrl: "", notes: "" };
      await createSubmissionRequest(token, {
        milestoneId,
        fileUrl: state.fileUrl,
        notes: state.notes,
      });

      await loadProject();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onRateSubmission(submissionId: string) {
    if (!token) {
      return;
    }

    const value = Number(ratingInputs[submissionId] ?? "0");
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      setError("Rating must be between 0 and 100");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const report = await rateSubmissionRequest(token, submissionId, value);
      setValidationResult(report);
      setPaymentStatus(report.decision === "APPROVED" ? "RELEASED" : "DISPUTED");

      await loadProject();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading project...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-400">{error}</p>;
  }

  if (!project) {
    return <p className="text-slate-400">Project not found.</p>;
  }

  return (
    <section className="space-y-6">
      <PageIntro title={project.title} subtitle="Milestones, submissions, validation, and payout decisions are managed from this workspace." />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Project Header</h2>
            <p className="mt-1 text-sm text-slate-400">Participants and status at a glance.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill text={project.status} />
              <Pill text={`Client ${project.client.name}`} />
              <Pill text={project.freelancer ? `Freelancer ${project.freelancer.name}` : "Freelancer not assigned"} />
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/dashboard/chat/${project.id}`}>Open Chat</Link>
          </Button>
        </div>
        <div className="mt-4">
          <p className="mb-1 text-xs text-slate-400">Milestone Completion</p>
          <ProgressBar value={milestoneProgress} />
        </div>
      </Card>

      {canAssign ? (
        <Card>
          <h3 className="text-lg font-semibold">Assign Freelancer</h3>
          {applicants.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-slate-400">Applicants who showed interest:</p>
              {applicants.map((application) => (
                <div key={application.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div>
                    <p className="font-medium text-slate-100">{application.freelancer?.name}</p>
                    <p className="text-xs text-slate-400">Rating {application.freelancer?.rating} | Trust {application.freelancer?.trustScore}</p>
                    {application.message ? (
                      <p className="mt-1 text-xs text-slate-500">"{application.message}"</p>
                    ) : null}
                  </div>
                  <Button onClick={() => void onSelectApplicant(application.id)} disabled={saving || Boolean(project.freelancer)}>
                    {saving ? "Selecting..." : "Select Applicant"}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Select value={selectedFreelancerId} onChange={(event) => setSelectedFreelancerId(event.target.value)}>
              <option value="">Select freelancer</option>
              {freelancers.map((freelancer) => (
                <option key={freelancer.id} value={freelancer.id}>
                  {freelancer.name} (rating {freelancer.rating})
                </option>
              ))}
            </Select>
            <Button onClick={onAssignFreelancer} disabled={saving || !selectedFreelancerId}>
              {saving ? "Assigning..." : "Assign Freelancer"}
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Milestones</h3>
          {canApproveDraft ? (
            <Button variant="secondary" onClick={onApproveDraft} disabled={saving || project.draftApproved}>
              {project.draftApproved ? "Draft Approved" : "Approve Draft"}
            </Button>
          ) : null}
        </div>
        <div className="mt-4 space-y-3">
          {(project.milestones ?? []).map((milestone: any) => (
            <div key={milestone.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-sm text-slate-400">${Number(milestone.amount ?? 0).toFixed(2)}</p>
                </div>
                <Pill text={milestone.status} />
              </div>

              {canSubmit ? (
                <form onSubmit={(event) => onSubmitMilestone(event, milestone.id)} className="mt-3 space-y-2">
                  <Input
                    type="url"
                    placeholder="Submission file URL"
                    value={milestoneForms[milestone.id]?.fileUrl ?? ""}
                    onChange={(event) =>
                      setMilestoneForms((prev) => ({
                        ...prev,
                        [milestone.id]: {
                          ...(prev[milestone.id] ?? { fileUrl: "", notes: "" }),
                          fileUrl: event.target.value,
                        },
                      }))
                    }
                  />
                  <Textarea
                    rows={3}
                    placeholder="Submission notes"
                    value={milestoneForms[milestone.id]?.notes ?? ""}
                    onChange={(event) =>
                      setMilestoneForms((prev) => ({
                        ...prev,
                        [milestone.id]: {
                          ...(prev[milestone.id] ?? { fileUrl: "", notes: "" }),
                          notes: event.target.value,
                        },
                      }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="secondary" disabled={saving}>
                      Submit Work
                    </Button>
                  </div>
                </form>
              ) : null}

              {user?.role === "CLIENT" && milestone.submissions?.[0] ? (
                <div className="mt-3 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">
                    Latest submission status: {milestone.submissions[0].status}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={ratingInputs[milestone.submissions[0].id] ?? "70"}
                      onChange={(event) =>
                        setRatingInputs((prev) => ({
                          ...prev,
                          [milestone.submissions[0].id]: event.target.value,
                        }))
                      }
                    />
                    <Button
                      onClick={() => void onRateSubmission(milestone.submissions[0].id)}
                      disabled={saving || milestone.submissions[0].status !== "VALIDATED"}
                    >
                      {saving ? "Scoring..." : "Rate + Decide"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Submission and Validation Report</h3>
        <p className="mt-1 text-sm text-slate-400">AI score, client rating, and weighted final score determine release or dispute outcomes.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">AI Score</p>
            <p className="mt-1 text-2xl font-semibold">{validationResult?.aiScore ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Client Rating</p>
            <p className="mt-1 text-2xl font-semibold">{validationResult?.clientRating ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Final Score</p>
            <p className="mt-1 text-2xl font-semibold">{finalScore}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {validationResult?.breakdown?.missingElements?.length ? (
            <p className="text-sm text-amber-300">
              Missing requirements: {validationResult.breakdown.missingElements.join(", ")}
            </p>
          ) : null}
          <div>
            <p className="mb-1 text-xs text-slate-400">Requirement Match</p>
            <ProgressBar value={requirementMatch} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Completeness</p>
            <ProgressBar value={completeness} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Quality Metrics</p>
            <ProgressBar value={qualityMetrics} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Payment Status</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Pill text={paymentStatus} />
          <p className="text-sm text-slate-400">
            {paymentStatus === "RELEASED"
              ? "Escrow released to freelancer wallet."
              : paymentStatus === "DISPUTED"
                ? "Escrow remains locked pending dispute resolution."
                : "Awaiting client rating to compute final decision."}
          </p>
        </div>
      </Card>
    </section>
  );
}
