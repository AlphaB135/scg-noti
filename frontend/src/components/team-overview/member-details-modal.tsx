"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Member {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar: string;
  completedTasks: number;
  totalTasks: number;
  pendingTasks: number;
  lateTasks: number;
  status: "normal" | "warning" | "critical";
  lastActive: string;
  teamId: string;
}

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  type: "completed" | "late" | "pending" | "all" | null;
}

export function MemberDetailsModal({
  isOpen,
  onClose,
  members,
  type,
}: MemberDetailsModalProps) {
  // Get title and description based on type
  const getTitle = () => {
    switch (type) {
      case "completed":
        return "สมาชิกที่มีงานเสร็จสิ้น";
      case "late":
        return "สมาชิกที่มีงานล่าช้า";
      case "pending":
        return "สมาชิกที่มีงานรอดำเนินการ";
      case "all":
        return "สมาชิกทั้งหมดในทีม";
      default:
        return "รายละเอียดสมาชิก";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "completed":
        return "รายชื่อสมาชิกที่มีงานเสร็จสิ้นแล้ว";
      case "late":
        return "รายชื่อสมาชิกที่มีงานล่าช้า ควรติดตาม";
      case "pending":
        return "รายชื่อสมาชิกที่มีงานรอดำเนินการ";
      case "all":
        return "รายชื่อสมาชิกทั้งหมดในทีมและสถานะงาน";
      default:
        return "";
    }
  };

  // Get relevant task count based on type
  const getRelevantTaskCount = (member: Member) => {
    switch (type) {
      case "completed":
        return member.completedTasks;
      case "late":
        return member.lateTasks;
      case "pending":
        return member.pendingTasks;
      case "all":
        return member.totalTasks;
      default:
        return 0;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "warning":
        return <Clock className="h-4 w-4 mr-1" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "ปกติ";
      case "warning":
        return "ควรติดตาม";
      case "critical":
        return "น่าเป็นห่วง";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {members.length > 0 ? (
            [...members]
              .sort((a, b) => {
                const statusPriority = { critical: 0, warning: 1, normal: 2 };
                return statusPriority[a.status] - statusPriority[b.status];
              })
              .map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 border-2 border-red-800/10">
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-red-800/10 text-red-800">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-gray-500 text-sm">
                          {member.position}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={getStatusColor(member.status)}
                      variant="secondary"
                    >
                      <span className="flex items-center text-xs">
                        {getStatusIcon(member.status)}
                        {getStatusText(member.status)}
                      </span>
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-green-50 p-2 rounded-md">
                      <span className="block font-medium text-green-700">
                        {member.completedTasks}
                      </span>
                      <span className="text-green-600">เสร็จสิ้น</span>
                    </div>

                    <div className="bg-red-50 p-2 rounded-md">
                      <span className="block font-medium text-red-700">
                        {member.lateTasks}
                      </span>
                      <span className="text-red-600">ล่าช้า</span>
                    </div>

                    <div className="bg-yellow-50 p-2 rounded-md">
                      <span className="block font-medium text-yellow-700">
                        {member.pendingTasks}
                      </span>
                      <span className="text-yellow-600">รอดำเนินการ</span>
                    </div>

                    <div className="bg-blue-50 p-2 rounded-md">
                      <span className="block font-medium text-blue-700">
                        {member.totalTasks}
                      </span>
                      <span className="text-blue-600">ทั้งหมด</span>
                    </div>
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-xs text-gray-400">
                      อัพเดทล่าสุด: {member.lastActive}
                    </span>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              ไม่พบสมาชิกที่มีข้อมูลในหมวดหมู่นี้
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
