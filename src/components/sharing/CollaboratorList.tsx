import React from 'react';
import { ShieldCheck, User as UserIcon, Trash2, Mail, Clock, CheckCircle } from 'lucide-react';
import { Collaborator, CollaboratorRole } from '../../types/sharing';

interface CollaboratorListProps {
  ownerName: string;
  ownerEmail?: string;
  collaborators: Collaborator[];
  onUpdatePermission: (collaboratorId: string, role: CollaboratorRole) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
}

export const CollaboratorList: React.FC<CollaboratorListProps> = ({
  ownerName,
  ownerEmail,
  collaborators,
  onUpdatePermission,
  onRemoveCollaborator,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#17201D]">People with access</span>
        <span className="text-[11px] font-semibold text-[#838F8B]">
          {collaborators.length + 1} total
        </span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
        {/* Owner Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
              {(ownerName || 'O').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#17201D] truncate flex items-center gap-1.5">
                <span>{ownerName || 'Trip Owner'}</span>
                <span className="text-[10px] text-[#20B8A6] font-normal">(You)</span>
              </p>
              {ownerEmail && <p className="text-[10px] text-[#838F8B] truncate">{ownerEmail}</p>}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F8F5] text-[#179E8E] text-[10px] font-bold shrink-0 border border-[#20B8A6]/20">
            <ShieldCheck className="w-3 h-3" />
            Owner
          </span>
        </div>

        {/* Invited Collaborators */}
        {collaborators.map((collab) => (
          <div
            key={collab.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EAE6DD] hover:border-[#17201D]/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#F4F1EA] text-[#5E6B67] flex items-center justify-center text-xs font-bold shrink-0">
                {(collab.name || collab.email || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#17201D] truncate">{collab.name || collab.email}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#838F8B]">
                  <span className="truncate">{collab.email}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-[#E08A00]">
                    <Clock className="w-2.5 h-2.5" />
                    {collab.status === 'pending' ? 'Pending' : 'Accepted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Permission Control & Delete */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={collab.role}
                onChange={(e) =>
                  onUpdatePermission(collab.id, e.target.value as CollaboratorRole)
                }
                className="px-2.5 py-1 rounded-xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-medium text-[#17201D] focus:outline-none cursor-pointer"
              >
                <option value="viewer">Can view</option>
                <option value="editor">Can edit</option>
              </select>

              <button
                type="button"
                onClick={() => onRemoveCollaborator(collab.id)}
                className="p-1.5 rounded-lg text-[#838F8B] hover:text-[#D94F3D] hover:bg-[#FFF2EE] transition-colors cursor-pointer"
                title="Remove access"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
