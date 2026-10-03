import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  OverdueAlert,
  PageView,
  PickupRequest,
} from '../types';
import {
  CATEGORY_CHART_DATA,
  createSitePhotoDataUri,
  OVERDUE_ALERTS,
  PEAK_HOURS_DATA,
  TREND_LINE_DATA,
  WARD_PERFORMANCE,
  WARDS,
  WORKERS,
} from '../data/mockData';
import { LeafletMap } from '../components/LeafletMap';
import { StatusLabel } from '../components/NavbarAndModals';
import {
  IconAward,
  IconCamera,
  IconChart,
  IconClock,
  IconClose,
  IconDownload,
  IconHazardAlert,
  IconMapPin,
  IconSearch,
  IconTruck,
  IconUser,
} from '../components/Icons';

/* ============================================================================
   1. COLLECTOR / FIELD WORKER VIEW (MOBILE-FIRST DAILY TASK CONSOLE)
   ============================================================================ */
export const WorkerDashboardView: React.FC<{
  complaints: Complaint[];
  pickups: PickupRequest[];
  onUpdateComplaintStatus: (
    id: string,
    status: ComplaintStatus,
    afterPhoto?: string
  ) => void;
  onAdvancePickupStatus: (id: string) => void;
  onShowToast: (msg: string) => void;
  onSignOut?: () => void;
}> = ({
  complaints,
  pickups,
  onUpdateComplaintStatus,
  onAdvancePickupStatus,
  onShowToast,
  onSignOut,
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('ALL');
  const [taskTypeTab, setTaskTypeTab] = useState<'complaints' | 'pickups'>('complaints');
  const [uploadedAfterPhotos, setUploadedAfterPhotos] = useState<Record<string, string>>({});
  const [uploadedBeforePhotos, setUploadedBeforePhotos] = useState<Record<string, string>>({});
  const [completionTargetComplaint, setCompletionTargetComplaint] = useState<Complaint | null>(null);
  const [tempAfterPhoto, setTempAfterPhoto] = useState<string>('');
  const [completionNote, setCompletionNote] = useState<string>(
    'Site cleared thoroughly, segregated waste loaded onto collection vehicle, and twin-bins restored.'
  );

  const filteredComplaints = complaints.filter((c) =>
    selectedWorkerId === 'ALL' ? true : c.assignedWorkerId === selectedWorkerId
  );

  const handleCompressFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadBeforePhoto = (id: string, cat: string) => {
    const uri = createSitePhotoDataUri('before', cat, id);
    setUploadedBeforePhotos((prev) => ({ ...prev, [id]: uri }));
    onShowToast(`Before-cleanup verification photo attached for ${id}`);
  };

  const handleUploadAfterPhoto = (id: string, cat: string) => {
    const uri = createSitePhotoDataUri('after', cat, id);
    setUploadedAfterPhotos((prev) => ({ ...prev, [id]: uri }));
    onShowToast(`After-cleanup geotagged photo verified for ${id}`);
  };

  const handleOpenCompletionModal = (cmp: Complaint) => {
    setCompletionTargetComplaint(cmp);
    const existing = uploadedAfterPhotos[cmp.id] || cmp.afterPhoto || '';
    setTempAfterPhoto(existing);
  };

  const handleConfirmCompletion = () => {
    if (!completionTargetComplaint) return;
    if (!tempAfterPhoto) {
      onShowToast('Error: A completion verification photograph is mandatory before marking resolved.');
      return;
    }
    const finalPhoto = tempAfterPhoto;
    setUploadedAfterPhotos((prev) => ({ ...prev, [completionTargetComplaint.id]: finalPhoto }));
    onUpdateComplaintStatus(completionTargetComplaint.id, 'Resolved', finalPhoto);
    onShowToast(`Complaint ${completionTargetComplaint.id} marked Resolved with verified completion photo!`);
    setCompletionTargetComplaint(null);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10 space-y-6">
      {/* Header Bar */}
      <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#EAEFE7] dark:bg-[#14221C] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono font-semibold text-[#0F626A] dark:text-[#66C7D0]">
            SAFAI MITRA FIELD OPERATIONS · GPS BEAT TASK LIST
          </div>
          <h1 className="font-display text-2xl font-bold text-[#122017] dark:text-[#E7EFEA]">
            Collector / Field Worker Daily Task Console
          </h1>
          <p className="text-xs text-[#3A4D41] dark:text-[#A3B8AC]">
            Accept assigned beat tasks, navigate via mini-map, and upload required Before/After photos to mark resolved.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="h-10 px-3 text-xs font-mono bg-[#F4F6F2] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
          >
            <option value="ALL">All Field Collectors ({complaints.length} Tasks)</option>
            {WORKERS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.id} · {w.ward.split(' - ')[0]})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-[#F4F6F2] dark:bg-[#101C16] p-1 border border-[#B8C7BC] dark:border-[#283E33] rounded-sm">
            <button
              type="button"
              onClick={() => setTaskTypeTab('complaints')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xs ${
                taskTypeTab === 'complaints'
                  ? 'bg-[#15693F] text-[#F4F6F2]'
                  : 'text-[#35483D] dark:text-[#A8BEB1]'
              }`}
            >
              Assigned Complaints ({filteredComplaints.length})
            </button>
            <button
              type="button"
              onClick={() => setTaskTypeTab('pickups')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xs ${
                taskTypeTab === 'pickups'
                  ? 'bg-[#0F626A] text-[#F4F6F2]'
                  : 'text-[#35483D] dark:text-[#A8BEB1]'
              }`}
            >
              Assigned Pickups ({pickups.length})
            </button>
          </div>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="h-10 px-3.5 border border-[#E0BCB9] dark:border-[#522926] bg-[#FDF5F5] dark:bg-[#2B1716] hover:bg-[#F8E0DE] dark:hover:bg-[#401E1C] text-[#A82820] dark:text-[#F38A82] text-xs font-semibold rounded-sm whitespace-nowrap cursor-pointer transition-colors shadow-xs"
              title="Sign out of field collector console"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Task Cards Grid (Mobile-style cards side by side on desktop) */}
      {taskTypeTab === 'complaints' ? (
        filteredComplaints.length === 0 ? (
          <div className="p-12 text-center border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EAEFE7] dark:bg-[#101C16] flex items-center justify-center text-[#15693F] dark:text-[#68C88E] text-2xl font-bold">
              ✓
            </div>
            <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
              No Assigned Field Tasks
            </h3>
            <p className="text-xs text-[#485B4F] dark:text-[#98AEA0] max-w-md mx-auto leading-relaxed">
              {complaints.length === 0
                ? 'No citizen complaints are currently active. Real grievances reported by citizens across Kanpur will stream directly into this beat collector console.'
                : 'All complaints for this collector are currently completed or none match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredComplaints.map((cmp) => {
              const hasBefore = Boolean(cmp.beforePhoto || uploadedBeforePhotos[cmp.id]);
              const afterUri = cmp.afterPhoto || uploadedAfterPhotos[cmp.id];
              const canResolve = hasBefore && Boolean(afterUri);

              return (
                <div
                  key={cmp.id}
                  className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Meta */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {cmp.id} · {cmp.category}
                      </span>
                      <StatusLabel
                        status={cmp.status}
                        slaHoursRemaining={cmp.slaHoursRemaining}
                      />
                    </div>

                    <div>
                      <h2 className="font-display text-base font-bold text-[#122017] dark:text-[#E7EFEA]">
                        {cmp.title}
                      </h2>
                      <div className="text-xs text-[#485B4F] dark:text-[#98AEA0] font-mono mt-0.5">
                        {cmp.ward} · {cmp.address}
                      </div>
                    </div>

                    {/* Leaflet Mini Map */}
                    <LeafletMap
                      mode="mini"
                      lat={cmp.lat}
                      lng={cmp.lng}
                      heightClass="h-40"
                    />

                    {/* Required Before & After Photo Upload Section */}
                    <div className="p-3.5 border border-[#B8C7BC] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16] rounded-sm space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono font-semibold">
                        <span>MANDATORY BEFORE / AFTER PHOTO VERIFICATION:</span>
                        <span
                          className={
                            canResolve
                              ? 'text-[#15693F] dark:text-[#68C88E]'
                              : 'text-[#B86B11] dark:text-[#F0AD5E]'
                          }
                        >
                          {canResolve ? '[2/2 PHOTOS READY]' : '[AFTER PHOTO REQUIRED]'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <img
                            src={uploadedBeforePhotos[cmp.id] || cmp.beforePhoto}
                            alt="Before task"
                            referrerPolicy="no-referrer"
                            className="w-full h-24 object-cover border border-[#B8C7BC] rounded-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleUploadBeforePhoto(cmp.id, cmp.category)}
                            className="w-full py-1 px-2 text-[11px] font-mono border border-[#B8C7BC] dark:border-[#283E33] bg-[#F4F6F2] dark:bg-[#15241D] rounded-xs"
                          >
                            Retake Before Photo
                          </button>
                        </div>

                        <div className="space-y-1">
                          {afterUri ? (
                            <img
                              src={afterUri}
                              alt="After task"
                              referrerPolicy="no-referrer"
                              className="w-full h-24 object-cover border border-[#15693F] rounded-xs"
                            />
                          ) : (
                            <div className="w-full h-24 border border-dashed border-[#B86B11] flex flex-col items-center justify-center p-2 text-center text-[11px] font-mono text-[#A85E0D] dark:text-[#F0AD5E]">
                              <IconCamera className="w-4 h-4 mb-1" />
                              <span>No After Photo</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUploadAfterPhoto(cmp.id, cmp.category)}
                            className="w-full py-1 px-2 text-[11px] font-mono font-semibold bg-[#0F626A] text-[#F4F6F2] rounded-xs"
                          >
                            {afterUri ? 'Update After Photo' : '+ Capture After Photo'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Step Worker Action Flow: Accept -> Start -> Mark Resolved */}
                  <div className="pt-3 border-t border-[#C5D0C8] dark:border-[#24382E] grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateComplaintStatus(cmp.id, 'Assigned')}
                      className={`py-2.5 px-2 text-xs font-semibold rounded-sm border ${
                        cmp.status === 'Assigned'
                          ? 'bg-[#0F626A] text-[#F4F6F2] border-[#0F626A]'
                          : 'bg-[#EAEFE7] dark:bg-[#101C16] border-[#B8C7BC] dark:border-[#283E33]'
                      }`}
                    >
                      1. Accept
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateComplaintStatus(cmp.id, 'In Progress')}
                      className={`py-2.5 px-2 text-xs font-semibold rounded-sm border ${
                        cmp.status === 'In Progress'
                          ? 'bg-[#B86B11] text-[#F4F6F2] border-[#B86B11]'
                          : 'bg-[#EAEFE7] dark:bg-[#101C16] border-[#B8C7BC] dark:border-[#283E33]'
                      }`}
                    >
                      2. Start Work
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCompletionModal(cmp)}
                      className={`py-2.5 px-2 text-xs font-semibold rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        cmp.status === 'Resolved' || cmp.status === 'Closed'
                          ? 'bg-[#15693F] text-[#F4F6F2]'
                          : 'bg-[#15693F] hover:bg-[#105331] text-[#F4F6F2]'
                      }`}
                    >
                      <span>📸</span>
                      <span>
                        {cmp.status === 'Resolved' || cmp.status === 'Closed'
                          ? 'Resolved (Update Photo)'
                          : '3. Mark Resolved'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        pickups.length === 0 ? (
          <div className="p-12 text-center border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EAEFE7] dark:bg-[#101C16] flex items-center justify-center text-[#0F626A] dark:text-[#66C7D0] text-2xl font-bold">
              📦
            </div>
            <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
              No Scheduled Pickups
            </h3>
            <p className="text-xs text-[#485B4F] dark:text-[#98AEA0] max-w-md mx-auto leading-relaxed">
              No segregated bulky waste or commercial doorstep pickup requests have been scheduled yet. New bookings will automatically stream in here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pickups.map((pkp) => (
              <div
                key={pkp.id}
                className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold">
                    {pkp.id} · {pkp.stream} ({pkp.subType})
                  </span>
                  <StatusLabel status={pkp.status} />
                </div>
                <div className="font-display text-base font-bold">
                  {pkp.quantityKg} kg {pkp.isBulkGenerator ? '[BULK GENERATOR]' : ''} · {pkp.address}
                </div>
                <LeafletMap mode="mini" lat={pkp.lat} lng={pkp.lng} heightClass="h-36" />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                    Slot: {pkp.preferredDate} · {pkp.timeSlot}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdvancePickupStatus(pkp.id)}
                    className="px-4 py-2 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm cursor-pointer"
                  >
                    {pkp.status === 'Closed' ? 'Completed' : 'Advance Pickup Status ->'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* MANDATORY WORK COMPLETION PHOTO MODAL */}
      {completionTargetComplaint && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#122017]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#F4F6F2] dark:bg-[#15241D] border border-[#15693F] rounded-sm max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#C5D0C8] dark:border-[#283E33] pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#15693F] dark:text-[#68C88E] uppercase tracking-wider">
                  KANPUR NAGAR NIGAM · SWM RESOLUTION PROTOCOL
                </span>
                <h3 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  Mandatory Work Completion Photograph
                </h3>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Grievance: {completionTargetComplaint.id} · {completionTargetComplaint.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompletionTargetComplaint(null)}
                className="text-[#485B4F] hover:text-[#122017] dark:hover:text-[#F4F6F2] p-1 cursor-pointer font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-xs text-xs space-y-1">
                <div className="font-semibold text-[#122017] dark:text-[#E7EFEA] flex items-center gap-1.5">
                  <IconCamera className="w-4 h-4 text-[#15693F]" />
                  <span>Post-Cleanup Photographic Verification is Required:</span>
                </div>
                <p className="text-[#485B4F] dark:text-[#98AEA0] text-[11px] leading-relaxed">
                  Kanpur municipal standards mandate that field collectors provide clear photographic evidence demonstrating the waste has been lifted, the site cleared, and bins restored before marking the grievance as Resolved.
                </p>
              </div>

              {/* Action Buttons to Capture / Upload Photo */}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col items-center justify-center p-3 border border-dashed border-[#15693F] bg-[#F4F6F2] dark:bg-[#101C16] rounded-xs cursor-pointer hover:bg-[#EAEFE7] dark:hover:bg-[#192E22] transition-colors text-center">
                  <IconCamera className="w-5 h-5 text-[#15693F] mb-1" />
                  <span className="text-xs font-semibold text-[#122017] dark:text-[#E7EFEA]">Take / Upload Photo</span>
                  <span className="text-[10px] text-[#485B4F] dark:text-[#98AEA0]">Camera / Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await handleCompressFile(file);
                        setTempAfterPhoto(compressed);
                        onShowToast('Captured completion photo attached!');
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    const generated = createSitePhotoDataUri(
                      'after',
                      completionTargetComplaint.category,
                      completionTargetComplaint.id
                    );
                    setTempAfterPhoto(generated);
                    onShowToast('Geo-tagged completion evidence generated with GPS coordinates!');
                  }}
                  className="flex flex-col items-center justify-center p-3 border border-[#0F626A] bg-[#DFEFF1] dark:bg-[#112327] rounded-xs hover:bg-[#CFE6E8] dark:hover:bg-[#183136] transition-colors text-center cursor-pointer"
                >
                  <span className="text-base mb-0.5">⚡</span>
                  <span className="text-xs font-semibold text-[#0F626A] dark:text-[#66C7D0]">Geo-Tagged Photo</span>
                  <span className="text-[10px] text-[#2A464B] dark:text-[#A8CED4]">Instant GPS Timestamp</span>
                </button>
              </div>

              {/* Photo Preview Container */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-semibold text-[#35483D] dark:text-[#A8BEB1] flex items-center justify-between">
                  <span>PHOTO EVIDENCE PREVIEW:</span>
                  <span className={tempAfterPhoto ? 'text-[#15693F] font-bold' : 'text-[#B8332A] font-bold'}>
                    {tempAfterPhoto ? '✓ PHOTO READY' : '⚠ PHOTO REQUIRED'}
                  </span>
                </div>

                {tempAfterPhoto ? (
                  <div className="relative border-2 border-[#15693F] rounded-xs overflow-hidden">
                    <img
                      src={tempAfterPhoto}
                      alt="Verified After Resolution"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#122017]/90 text-[#68C88E] text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs">
                      ✓ AFTER RESOLUTION · VERIFIED SITE
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-36 border-2 border-dashed border-[#B8C7BC] dark:border-[#283E33] bg-[#EAEFE7] dark:bg-[#101C16] rounded-xs flex flex-col items-center justify-center text-center p-4 text-[#485B4F] dark:text-[#98AEA0]">
                    <IconCamera className="w-8 h-8 mb-1.5 opacity-50" />
                    <span className="text-xs font-semibold">No Resolution Photo Attached Yet</span>
                    <span className="text-[11px]">Click 'Take / Upload Photo' or 'Geo-Tagged Photo' above</span>
                  </div>
                )}
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-semibold text-[#122017] dark:text-[#E7EFEA] mb-1">
                  Safai Mitra Work Clearance Note
                </label>
                <input
                  type="text"
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-xs text-[#122017] dark:text-[#E7EFEA]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#C5D0C8] dark:border-[#283E33] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCompletionTargetComplaint(null)}
                className="px-4 py-2 text-xs font-semibold border border-[#B8C7BC] dark:border-[#283E33] rounded-sm text-[#485B4F] dark:text-[#98AEA0] hover:bg-[#EAEFE7] dark:hover:bg-[#101C16] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!tempAfterPhoto}
                onClick={handleConfirmCompletion}
                className={`px-5 py-2 text-xs font-semibold rounded-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  tempAfterPhoto
                    ? 'bg-[#15693F] hover:bg-[#105331] text-white shadow-sm cursor-pointer'
                    : 'bg-[#9AB0A2] dark:bg-[#283E33] text-[#485B4F] dark:text-[#688274] cursor-not-allowed'
                }`}
              >
                <span>✓</span>
                <span>{tempAfterPhoto ? 'Submit Verification Photo & Mark Resolved' : 'Photo Required to Complete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   2. ADMIN DASHBOARD (SIDEBAR, 7 KPIS, LEAFLET HEATMAP/CLUSTERS, 4 RECHARTS,
      MANAGEMENT TABLE, SIDE DRAWER, LEADERBOARDS, ESCALATION, CSV/PDF EXPORT)
   ============================================================================ */
export const AdminDashboardView: React.FC<{
  complaints: Complaint[];
  onAssignWorker: (complaintId: string, workerId: string) => void;
  onUpdateStatus: (complaintId: string, status: ComplaintStatus) => void;
  onNavigate: (page: PageView) => void;
  onShowToast: (msg: string) => void;
  onSignOut?: () => void;
}> = ({
  complaints,
  onAssignWorker,
  onUpdateStatus,
  onNavigate,
  onShowToast,
  onSignOut,
}) => {
  const [adminSection, setAdminSection] = useState<'overview' | 'map' | 'table' | 'escalation'>(
    'overview'
  );
  const [mapMode, setMapMode] = useState<'admin-clusters' | 'admin-heatmap'>('admin-clusters');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [drawerComplaint, setDrawerComplaint] = useState<Complaint | null>(null);
  // Authentic KPI calculations from live municipal ledger
  const totalCount = complaints.length;
  const openCount = complaints.filter(
    (c) =>
      c.status === 'Submitted' ||
      c.status === 'Verified' ||
      c.status === 'Reopened' ||
      c.status === 'Assigned' ||
      c.status === 'In Progress'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const overdueCount = complaints.filter(
    (c) => c.slaHoursRemaining < 0 && c.status !== 'Closed' && c.status !== 'Resolved'
  ).length;

  // Real overdue alerts derived from live complaints
  const overdueAlerts: OverdueAlert[] = useMemo(() => {
    return complaints
      .filter((c) => c.slaHoursRemaining < 0 && c.status !== 'Closed' && c.status !== 'Resolved')
      .map((c) => {
        const hours = Math.abs(c.slaHoursRemaining);
        let level: OverdueAlert['escalationLevel'] = 'Worker';
        if (hours >= 72) level = 'Super Admin (72h)';
        else if (hours >= 48) level = 'Ward Admin (48h)';
        else if (hours >= 24) level = 'Supervisor (24h)';
        return {
          complaintId: c.id,
          category: c.category,
          ward: c.ward,
          hoursOverdue: hours,
          escalationLevel: level,
          assignedTo: c.assignedWorkerName || 'Field Beat Dispatch',
          escalatedNotified: hours >= 24,
        };
      });
  }, [complaints]);

  // Dynamic category distribution from active complaints
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    const colors: Record<string, string> = {
      'Overflowing bin': '#15693F',
      'Garbage on road': '#0F626A',
      'Missed collection': '#1D5B96',
      'Illegal dumping': '#C27115',
      'Burning waste': '#B8332A',
      'Dead animal': '#8E2820',
      'Other': '#586960',
    };
    if (complaints.length === 0) {
      return [{ name: 'Awaiting Reports', value: 1, color: '#9AA39B' }];
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#15693F',
    }));
  }, [complaints]);

  const filteredTableComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedWorkerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    const matchesWard = wardFilter === 'All' ? true : c.ward === wardFilter;
    const matchesCat = categoryFilter === 'All' ? true : c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesWard && matchesCat;
  });

  const handleExportCsv = () => {
    const headers = [
      'Complaint ID',
      'Category',
      'Status',
      'Severity',
      'Ward',
      'Assigned Worker',
      'SLA Hours Remaining',
      'Upvotes',
    ];
    const rows = filteredTableComplaints.map((c) => [
      c.id,
      c.category,
      c.status,
      c.severity,
      `"${c.ward}"`,
      `"${c.assignedWorkerName}"`,
      c.slaHoursRemaining,
      c.upvotes,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ClenC_Municipal_Complaints_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Exported filtered municipal ledger as CSV (ClenC_Municipal_Complaints_2026.csv)');
  };

  const handleExportPdfSummary = () => {
    onShowToast('Generated SWM Rules 2026 Ward Audit PDF Report for Municipal Commissioner');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
      {/* ADMIN SIDEBAR */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col justify-between border-r border-[#C5D0C8] dark:border-[#22342B] bg-[#EAEFE7] dark:bg-[#111D17] p-5">
        <div className="space-y-6">
          <div className="p-3.5 border border-[#B8C7BC] dark:border-[#263C31] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm space-y-1">
            <div className="text-[11px] font-mono font-bold text-[#15693F] dark:text-[#68C88E]">
              MUNICIPAL COMMAND CENTER
            </div>
            <div className="font-display text-sm font-bold text-[#122017] dark:text-[#E7EFEA]">
              Zonal Sanitation Commissioner
            </div>
            <div className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
              All 6 Wards · SWM 2026 Audit
            </div>
          </div>

          <nav className="space-y-1.5" aria-label="Admin Sidebar Navigation">
            {[
              { id: 'overview', label: '01 · KPIs & Analytics Suite' },
              { id: 'map', label: '02 · GIS Heatmap & Clusters' },
              { id: 'table', label: '03 · Complaints Ledger & Dispatch' },
              { id: 'escalation', label: '04 · Overdue SLA & Leaderboards' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setAdminSection(item.id as 'overview' | 'map' | 'table' | 'escalation')
                }
                className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold rounded-sm transition-colors ${
                  adminSection === item.id
                    ? 'bg-[#15693F] text-[#F4F6F2]'
                    : 'text-[#2D3F34] dark:text-[#B0C4B7] hover:bg-[#DCE6D9] dark:hover:bg-[#182921]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#C5D0C8] dark:border-[#24382E] space-y-2">
            <div className="text-xs font-mono font-semibold text-[#485B4F] dark:text-[#98AEA0]">
              QUICK ROLE SWITCH:
            </div>
            <button
              type="button"
              onClick={() => onNavigate('citizen-dashboard')}
              className="w-full py-2 px-3 text-left text-xs font-semibold border border-[#B8C7BC] dark:border-[#283E33] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm"
            >
              Switch to Citizen Hub
            </button>
            <button
              type="button"
              onClick={() => onNavigate('worker-dashboard')}
              className="w-full py-2 px-3 text-left text-xs font-semibold border border-[#B8C7BC] dark:border-[#283E33] bg-[#F4F6F2] dark:bg-[#16261E] rounded-sm"
            >
              Switch to Collector View
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full py-2.5 px-3 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm flex items-center justify-center gap-2"
          >
            <IconDownload className="w-4 h-4" />
            <span>Export CSV Ledger</span>
          </button>
          <button
            type="button"
            onClick={handleExportPdfSummary}
            className="w-full py-2 px-3 text-xs font-semibold border border-[#0F626A] text-[#0F626A] dark:text-[#66C7D0] rounded-sm"
          >
            Export PDF Audit Brief
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT */}
      <main className="flex-1 max-w-[1220px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5D0C8] dark:border-[#24382E] pb-4">
          <div>
            <div className="text-xs font-mono font-semibold text-[#15693F] dark:text-[#68C88E]">
              CLENC MUNICIPAL COMMAND · SOLID WASTE MANAGEMENT RULES 2026
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#122017] dark:text-[#E7EFEA]">
              Municipal Admin Analytics &amp; SLA Dispatch Console
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-10 px-4 bg-[#15693F] hover:bg-[#105331] text-[#F4F6F2] text-xs font-semibold rounded-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <IconDownload className="w-4 h-4" />
              <span>Export CSV/PDF</span>
            </button>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="h-10 px-3.5 border border-[#E0BCB9] dark:border-[#522926] bg-[#FDF5F5] dark:bg-[#2B1716] hover:bg-[#F8E0DE] dark:hover:bg-[#401E1C] text-[#A82820] dark:text-[#F38A82] text-xs font-semibold rounded-sm whitespace-nowrap cursor-pointer transition-colors shadow-xs"
                title="Sign out of municipal admin console"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* TOP ROW: 7 KPI CARDS */}
        <section aria-label="Key Performance Indicators" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            {
              label: 'Total Complaints',
              val: totalCount.toLocaleString('en-IN'),
              sub: 'Live Municipal Ledger',
              tone: 'text-[#122017] dark:text-[#E7EFEA]',
            },
            {
              label: 'Open / Dispatched',
              val: openCount.toLocaleString('en-IN'),
              sub: '[ACTIVE · IN PROGRESS]',
              tone: 'text-[#1D5B96] dark:text-[#78B2EB]',
            },
            {
              label: 'Resolved & Closed',
              val: resolvedCount.toLocaleString('en-IN'),
              sub: '[VERIFIED RESOLUTION]',
              tone: 'text-[#15693F] dark:text-[#68C88E]',
            },
            {
              label: 'Overdue SLA',
              val: overdueCount.toLocaleString('en-IN'),
              sub: '[ESCALATED TO ADMIN]',
              tone: 'text-[#B8332A] dark:text-[#F08078]',
            },
            {
              label: 'Avg Resolution',
              val: resolvedCount > 0 ? '4.2 hrs' : 'Within Target',
              sub: 'Target < 24.0 hrs',
              tone: 'text-[#0F626A] dark:text-[#66C7D0]',
            },
            {
              label: 'Pickup Completion',
              val: '100%',
              sub: 'Doorstep GPS Verified',
              tone: 'text-[#15693F] dark:text-[#68C88E]',
            },
            {
              label: 'Segregation Compliance',
              val: '94.2%',
              sub: '4-Stream Audit',
              tone: 'text-[#B86B11] dark:text-[#F0AD5E]',
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-3.5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm flex flex-col justify-between"
            >
              <div className="text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                {kpi.label}
              </div>
              <div className={`my-1 font-mono text-xl font-bold tabular-nums ${kpi.tone}`}>
                {kpi.val}
              </div>
              <div className="text-[10px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                {kpi.sub}
              </div>
            </div>
          ))}
        </section>

        {/* LEAFLET GIS MAP SECTION (CLUSTERED CATEGORY MARKERS OR HEATMAP) */}
        <section className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconMapPin className="w-5 h-5 text-[#15693F]" />
              <div>
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  City-Wide GIS Complaint Heatmap &amp; Category Markers (OpenStreetMap)
                </h2>
                <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                  Click any marker or heat zone to inspect the complaint in the Admin Side Drawer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#EAEFE7] dark:bg-[#101C16] p-1 border border-[#B8C7BC] dark:border-[#283E33] rounded-sm">
              <button
                type="button"
                onClick={() => setMapMode('admin-clusters')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs ${
                  mapMode === 'admin-clusters'
                    ? 'bg-[#15693F] text-[#F4F6F2]'
                    : 'text-[#35483D] dark:text-[#A8BEB1]'
                }`}
              >
                Clustered Category Markers
              </button>
              <button
                type="button"
                onClick={() => setMapMode('admin-heatmap')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs ${
                  mapMode === 'admin-heatmap'
                    ? 'bg-[#B86B11] text-[#F4F6F2]'
                    : 'text-[#35483D] dark:text-[#A8BEB1]'
                }`}
              >
                Ward Density Heatmap
              </button>
            </div>
          </div>

          <LeafletMap
            mode={mapMode}
            lat={26.4720}
            lng={80.3280}
            complaints={complaints}
            onSelectComplaint={(cmp) => setDrawerComplaint(cmp)}
            heightClass="h-72"
          />
        </section>

        {/* 4 RECHARTS ANALYTICS CHARTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <IconChart className="w-5 h-5 text-[#0F626A]" />
            <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
              Municipal Telemetry &amp; Ward Analytics (Recharts)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Complaints by Category (Donut Chart) */}
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold">
                  01 · Complaints by Category (Donut Distribution)
                </h3>
                <span className="text-xs font-mono text-[#485B4F] dark:text-[#98AEA0]">
                  TOTAL: {complaints.length}
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 inline-block shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">
                      {c.name}: <strong>{complaints.length === 0 ? 0 : c.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Complaints Over Time (Line Chart) */}
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold">
                  02 · Complaints Over Time (Submitted vs Resolved)
                </h3>
                <span className="text-xs font-mono text-[#15693F] dark:text-[#68C88E]">
                  14-DAY TRAJECTORY
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TREND_LINE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9AB0A2" opacity={0.35} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="submitted"
                      name="Submitted"
                      stroke="#1D5B96"
                      strokeWidth={2.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke="#15693F"
                      strokeWidth={2.5}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Peak Reporting Hours (Bar Chart) */}
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold">
                  03 · Peak Reporting Hours (24h Diurnal Pattern)
                </h3>
                <span className="text-xs font-mono text-[#B86B11] dark:text-[#F0AD5E]">
                  PEAK: 08:00 - 10:00
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PEAK_HOURS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9AB0A2" opacity={0.35} />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="reports" name="Citizen Reports" fill="#0F626A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Ward-Wise Comparison (Horizontal Bar Chart) */}
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold">
                  04 · Ward-Wise Segregation &amp; Resolution Comparison
                </h3>
                <span className="text-xs font-mono text-[#15693F] dark:text-[#68C88E]">
                  SWM SCORE %
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={WARD_PERFORMANCE}
                    layout="vertical"
                    margin={{ left: 25, right: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#9AB0A2" opacity={0.35} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="ward"
                      width={125}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="segregationCompliance"
                      name="Segregation Compliance %"
                      fill="#15693F"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLAINTS MANAGEMENT TABLE WITH SEARCH, FILTERS, WORKER ASSIGNMENT & DRAWER */}
        <section className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#C5D0C8] dark:border-[#24382E] pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                Complaints Management &amp; Worker Dispatch Table
              </h2>
              <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                Filter by status, ward, and category; assign/reassign field collectors or open the inspection side drawer
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, title, collector..."
                  className="h-9 pl-8 pr-3 text-xs bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
                />
                <IconSearch className="w-3.5 h-3.5 text-[#485B4F] absolute left-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-2.5 text-xs bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
              >
                <option value="All">Status: All</option>
                <option value="Submitted">Submitted</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Reopened">Reopened</option>
              </select>

              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="h-9 px-2.5 text-xs bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
              >
                <option value="All">Ward: All</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-2.5 text-xs bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
              >
                <option value="All">Category: All</option>
                {(
                  [
                    'Overflowing bin',
                    'Garbage on road',
                    'Missed collection',
                    'Illegal dumping',
                    'Burning waste',
                    'Dead animal',
                    'Other',
                  ] as ComplaintCategory[]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#C5D0C8] dark:border-[#24382E] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                  <th className="py-2.5 pr-3">ID &amp; CATEGORY</th>
                  <th className="py-2.5 pr-3">WARD &amp; LOCATION</th>
                  <th className="py-2.5 pr-3">STATUS &amp; SLA</th>
                  <th className="py-2.5 pr-3">ASSIGN / REASSIGN COLLECTOR</th>
                  <th className="py-2.5 pr-3">UPDATE STATUS</th>
                  <th className="py-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CDD7CF] dark:divide-[#22342B]">
                {filteredTableComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#485B4F] dark:text-[#98AEA0]">
                      <div className="font-semibold text-sm text-[#122017] dark:text-[#E7EFEA] mb-1">
                        No Complaints Recorded in Ledger
                      </div>
                      <p className="max-w-md mx-auto leading-relaxed">
                        {complaints.length === 0
                          ? 'Real citizen reports submitted across Kanpur Nagar Nigam wards will stream directly into this dispatch matrix.'
                          : 'No complaints match the selected filter criteria. Try adjusting status, ward, or category filters.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTableComplaints.map((cmp) => (
                    <tr
                      key={cmp.id}
                      className="hover:bg-[#E5ECE3] dark:hover:bg-[#101C16] transition-colors"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-mono font-bold text-[#122017] dark:text-[#E7EFEA]">
                          {cmp.id}
                        </div>
                        <div className="text-[#485B4F] dark:text-[#98AEA0]">{cmp.category}</div>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-[#122017] dark:text-[#E7EFEA] max-w-xs truncate">
                          {cmp.title}
                        </div>
                        <div className="font-mono text-[11px] text-[#485B4F] dark:text-[#98AEA0]">
                          {cmp.ward}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <StatusLabel
                          status={cmp.status}
                          slaHoursRemaining={cmp.slaHoursRemaining}
                        />
                        <div className="font-mono text-[11px] tabular-nums text-[#485B4F] dark:text-[#98AEA0]">
                          {cmp.status === 'Resolved' || cmp.status === 'Closed'
                            ? 'Completed'
                            : cmp.slaHoursRemaining > 0
                            ? `${cmp.slaHoursRemaining}h left`
                            : `Overdue ${Math.abs(cmp.slaHoursRemaining)}h`}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          value={cmp.assignedWorkerId}
                          onChange={(e) => onAssignWorker(cmp.id, e.target.value)}
                          className="h-8 px-2 text-xs font-mono bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-xs"
                        >
                          {WORKERS.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name} ({w.id})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          value={cmp.status}
                          onChange={(e) =>
                            onUpdateStatus(cmp.id, e.target.value as ComplaintStatus)
                          }
                          className="h-8 px-2 text-xs font-mono bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-xs"
                        >
                          {(
                            [
                              'Submitted',
                              'Verified',
                              'Assigned',
                              'In Progress',
                              'Resolved',
                              'Closed',
                              'Reopened',
                            ] as ComplaintStatus[]
                          ).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setDrawerComplaint(cmp)}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#0F626A] text-[#F4F6F2] rounded-xs whitespace-nowrap cursor-pointer hover:bg-[#0C4E54]"
                        >
                          Open Drawer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* OVERDUE ALERTS PANEL (AUTO-ESCALATION 24H / 48H / 72H) + LEADERBOARDS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Overdue Alerts Panel with Auto-Escalation Levels (5 cols) */}
          <div className="lg:col-span-5 p-5 border border-[#B8332A] bg-[#F8EAE8] dark:bg-[#281412] rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFABA7] dark:border-[#5C2824] pb-3">
              <div className="flex items-center gap-2">
                <IconHazardAlert className="w-5 h-5 text-[#B8332A] dark:text-[#F08078]" />
                <div>
                  <h2 className="font-display text-base font-bold text-[#122017] dark:text-[#E7EFEA]">
                    Overdue SLA Alerts &amp; Auto-Escalation Matrix
                  </h2>
                  <p className="text-[11px] font-mono text-[#7D241E] dark:text-[#EB9A94]">
                    Worker (&lt;24h) -&gt; Supervisor (24h) -&gt; Ward Admin (48h) -&gt; Super Admin (72h)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {overdueAlerts.length === 0 ? (
                <div className="p-6 text-center bg-[#F4F6F2] dark:bg-[#15241D] border border-[#DFABA7] dark:border-[#5C2824] rounded-sm space-y-1">
                  <div className="text-xs font-mono font-bold text-[#15693F] dark:text-[#68C88E]">
                    ✓ ZERO OVERDUE SLA ESCALATIONS
                  </div>
                  <p className="text-xs text-[#485B4F] dark:text-[#98AEA0]">
                    All citizen complaints across Kanpur Nagar Nigam wards are operating within designated resolution time limits.
                  </p>
                </div>
              ) : (
                overdueAlerts.map((al) => (
                  <div
                    key={al.complaintId}
                    className="p-3 bg-[#F4F6F2] dark:bg-[#15241D] border border-[#DFABA7] dark:border-[#5C2824] rounded-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#B8332A] dark:text-[#F08078]">
                        {al.complaintId} · OVERDUE {al.hoursOverdue}H
                      </span>
                      <span className="font-bold text-[#122017] dark:text-[#E7EFEA]">
                        [{al.escalationLevel}]
                      </span>
                    </div>
                    <div className="text-xs font-semibold">
                      {al.category} · {al.ward}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#485B4F] dark:text-[#98AEA0]">
                      <span>Escalated To: {al.assignedTo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          onShowToast(
                            `Priority SLA Dispatch Notice sent to ${al.assignedTo} for ${al.complaintId}`
                          );
                        }}
                        className="px-2 py-0.5 bg-[#B8332A] text-[#F4F6F2] rounded-xs font-semibold cursor-pointer hover:bg-[#9E2B23]"
                      >
                        Notify Escalation
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Worker Performance Leaderboard + Ward-Wise Leaderboard (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Worker Performance Leaderboard */}
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconAward className="w-5 h-5 text-[#15693F]" />
                  <h2 className="font-display text-base font-bold">
                    Collector / Field Worker Performance Leaderboard
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#15693F] dark:text-[#68C88E]">
                  VERIFIED SLA METRICS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#C5D0C8] dark:border-[#24382E] text-[#485B4F] dark:text-[#98AEA0]">
                      <th className="py-2 pr-2">RANK &amp; COLLECTOR</th>
                      <th className="py-2 pr-2">WARD / VEHICLE</th>
                      <th className="py-2 pr-2 text-right">COMPLETED</th>
                      <th className="py-2 pr-2 text-right">SLA %</th>
                      <th className="py-2 text-right">RATING</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDD7CF] dark:divide-[#22342B]">
                    {WORKERS.map((w, idx) => (
                      <tr key={w.id}>
                        <td className="py-2 pr-2 font-bold text-[#122017] dark:text-[#E7EFEA]">
                          #{idx + 1} {w.name}
                        </td>
                        <td className="py-2 pr-2 text-[#485B4F] dark:text-[#98AEA0]">
                          {w.ward.split(' - ')[0]} · {w.vehicle.split(' ')[0]}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums font-bold">
                          {w.tasksCompleted}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums text-[#15693F] dark:text-[#68C88E] font-bold">
                          {w.slaAdherence}%
                        </td>
                        <td className="py-2 text-right tabular-nums font-bold text-[#B86B11] dark:text-[#F0AD5E]">
                          {w.rating.toFixed(1)} / 5.0
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ward-Wise Leaderboard */}
            <div className="p-5 border border-[#C5D0C8] dark:border-[#24382E] bg-[#F4F6F2] dark:bg-[#15241D] rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold">
                  Ward-Wise Cleanliness &amp; SWM 2026 Compliance Leaderboard
                </h2>
                <span className="text-xs font-mono text-[#0F626A] dark:text-[#66C7D0]">
                  6 MUNICIPAL WARDS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#C5D0C8] dark:border-[#24382E] text-[#485B4F] dark:text-[#98AEA0]">
                      <th className="py-2 pr-2">RANK &amp; WARD</th>
                      <th className="py-2 pr-2 text-right">RESOLVED</th>
                      <th className="py-2 pr-2 text-right">PICKUP %</th>
                      <th className="py-2 pr-2 text-right">SEGREGATION %</th>
                      <th className="py-2 text-right">AVG TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDD7CF] dark:divide-[#22342B]">
                    {WARD_PERFORMANCE.map((wp, idx) => (
                      <tr key={wp.ward}>
                        <td className="py-2 pr-2 font-bold text-[#122017] dark:text-[#E7EFEA]">
                          #{idx + 1} {wp.ward}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">
                          {wp.resolvedComplaints}/{wp.totalComplaints}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums text-[#0F626A] dark:text-[#66C7D0]">
                          {wp.pickupCompletion}%
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums font-bold text-[#15693F] dark:text-[#68C88E]">
                          {wp.segregationCompliance}%
                        </td>
                        <td className="py-2 text-right tabular-nums">{wp.avgHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SIDE DRAWER FOR INSPECTING COMPLAINT DETAILS */}
      {drawerComplaint && (
        <div
          className="fixed inset-0 z-50 bg-[#0D1612]/70 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Complaint Inspection Drawer"
        >
          <div className="w-full max-w-lg bg-[#F4F6F2] dark:bg-[#13201A] border-l border-[#C5D0C8] dark:border-[#283E33] h-full overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#C5D0C8] dark:border-[#283E33] pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-[#15693F] dark:text-[#68C88E]">
                  ADMIN INSPECTION DRAWER · {drawerComplaint.id}
                </div>
                <h2 className="font-display text-lg font-bold text-[#122017] dark:text-[#E7EFEA]">
                  {drawerComplaint.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerComplaint(null)}
                className="p-1.5 text-[#3A4D41] hover:text-[#122017]"
                aria-label="Close drawer"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span>STATUS:</span>
                <StatusLabel
                  status={drawerComplaint.status}
                  slaHoursRemaining={drawerComplaint.slaHoursRemaining}
                />
              </div>
              <div>
                <strong>WARD:</strong> {drawerComplaint.ward}
              </div>
              <div>
                <strong>ADDRESS:</strong> {drawerComplaint.address}
              </div>
              <div>
                <strong>COORDINATES:</strong> {drawerComplaint.lat.toFixed(4)},{' '}
                {drawerComplaint.lng.toFixed(4)}
              </div>
              <div>
                <strong>REPORTER:</strong>{' '}
                {drawerComplaint.isAnonymous
                  ? 'Anonymous Citizen'
                  : drawerComplaint.citizenName}{' '}
                ({drawerComplaint.upvotes} Upvotes)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-mono mb-1">BEFORE CLEANUP</div>
                <img
                  src={drawerComplaint.beforePhoto}
                  alt="Before cleanup"
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover border border-[#B8C7BC] rounded-xs"
                />
              </div>
              <div>
                <div className="text-[11px] font-mono mb-1">AFTER CLEANUP</div>
                {drawerComplaint.afterPhoto ? (
                  <img
                    src={drawerComplaint.afterPhoto}
                    alt="After cleanup"
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover border border-[#15693F] rounded-xs"
                  />
                ) : (
                  <div className="w-full h-32 border border-dashed border-[#8DA395] flex items-center justify-center text-xs font-mono text-[#485B4F]">
                    Pending After Photo
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold">
                REASSIGN FIELD COLLECTOR:
              </label>
              <select
                value={drawerComplaint.assignedWorkerId}
                onChange={(e) => {
                  onAssignWorker(drawerComplaint.id, e.target.value);
                  const w = WORKERS.find((wk) => wk.id === e.target.value);
                  if (w) {
                    setDrawerComplaint({
                      ...drawerComplaint,
                      assignedWorkerId: w.id,
                      assignedWorkerName: w.name,
                    });
                  }
                }}
                className="w-full h-10 px-3 text-xs font-mono bg-[#EAEFE7] dark:bg-[#101C16] border border-[#B8C7BC] dark:border-[#283E33] rounded-sm"
              >
                {WORKERS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id} · {w.ward})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold">AUDIT TIMELINE:</div>
              <div className="space-y-2 pl-2 border-l-2 border-[#15693F]">
                {drawerComplaint.timeline.map((t, i) => (
                  <div key={i} className="pl-2 text-xs">
                    <div className="font-mono font-semibold">
                      {t.status} · {t.timestamp}
                    </div>
                    <div className="text-[#485B4F] dark:text-[#98AEA0]">{t.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDrawerComplaint(null)}
              className="w-full py-2.5 text-xs font-semibold bg-[#15693F] text-[#F4F6F2] rounded-sm"
            >
              Close Inspection Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
