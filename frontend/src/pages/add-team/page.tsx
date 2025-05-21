"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/components/layout/app-layout";
import { toast } from "sonner";

// Import components
import TeamManagement from "@/components/add-team/1.team-management";
import EmployeeList from "@/components/add-team/2.employee-list";
import CreateTeamDialog from "@/components/add-team/3.create-team-dialog";
import RemoveLeaderDialog from "@/components/add-team/4.remove-leader-dialog";
import PermissionDialog from "@/components/add-team/5.permission-dialog";

// Import types and API
import type {
  Team,
  TeamMember,
  PermissionLevel,
} from "@/components/types/team";
import { teamsApi } from "@/lib/api/teams";
import { employeesApi } from "@/lib/api/employees";
import type { Employee } from "@/lib/api/employees";
import type { EmployeeResponse } from "@/lib/api/employees";

export default function AddEmployeePage() {
  // State
  const [employees, setEmployees] = useState<
    (Employee & { selected?: boolean })[]
  >([]);
  const [filteredEmployees, setFilteredEmployees] = useState<
    (Employee & { selected?: boolean })[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isRemoveLeaderDialogOpen, setIsRemoveLeaderDialogOpen] =
    useState(false);
  const [selectedLeaderToRemove, setSelectedLeaderToRemove] =
    useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionLevel>("member");
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedMemberForPermission, setSelectedMemberForPermission] =
    useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Delete team
  const handleDeleteTeam = async () => {
    if (!currentTeam) return;

    if (
      !confirm("คุณแน่ใจหรือไม่ที่จะลบทีมนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")
    ) {
      return;
    }

    const loadingToast = toast.loading("กำลังลบทีม...");

    try {
      await teamsApi.delete(currentTeam.id);

      // Update teams list
      setTeams((prev) => prev.filter((team) => team.id !== currentTeam.id));
      setCurrentTeam(null);

      toast.dismiss(loadingToast);
      toast.success("ลบทีมเรียบร้อยแล้ว");
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error deleting team:", error);
      toast.error("ไม่สามารถลบทีมได้");
    }
  };

  // Fetch teams data
  const fetchTeams = async () => {
    try {
      const { data } = await teamsApi.list();
      setTeams(data);
      if (currentTeam) {
        const updatedCurrentTeam = data.find(
          (team) => team.id === currentTeam.id
        );
        if (
          updatedCurrentTeam &&
          JSON.stringify(updatedCurrentTeam) !== JSON.stringify(currentTeam)
        ) {
          setCurrentTeam(updatedCurrentTeam);
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("ไม่สามารถโหลดข้อมูลทีมได้");
    }
  };
  // Fetch employees with infinite scroll
  const fetchEmployees = useCallback(
    async (page: number = 1) => {
      try {
        if (page === 1) {
          setIsLoading(true);
        }

        const response = await employeesApi.list({
          page,
          size: pageSize,
          sortBy: "firstName",
          sortOrder: "asc",
        });

        // Map response data to add selected flag
        const employeesWithSelect = response.data.map((emp) => ({
          ...emp,
          selected: false,
          name: `${emp.employeeProfile.firstName} ${emp.employeeProfile.lastName}`,
          department: emp.employeeProfile.position || "ไม่ระบุตำแหน่ง",
        }));

        setEmployees((prev) =>
          page === 1 ? employeesWithSelect : [...prev, ...employeesWithSelect]
        );

        // อัพเดท filtered employees และ totalPages
        setFilteredEmployees((prev) => {
          const newFiltered =
            page === 1
              ? employeesWithSelect
              : [...prev, ...employeesWithSelect];

          // กรองตามการค้นหาและทีมปัจจุบัน
          if (searchQuery || currentTeam) {
            const filtered = newFiltered.filter((emp) => {
              // กรองสมาชิกที่อยู่ในทีมออก
              if (
                currentTeam &&
                currentTeam.members.some((member) => member.id === emp.id)
              ) {
                return false;
              }

              // กรองตามคำค้นหา
              if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const name =
                  `${emp.employeeProfile.firstName} ${emp.employeeProfile.lastName}`.toLowerCase();
                const position =
                  emp.employeeProfile.position?.toLowerCase() || "";
                const code = emp.employeeProfile.employeeCode.toLowerCase();

                return (
                  name.includes(query) ||
                  position.includes(query) ||
                  code.includes(query)
                );
              }

              return true;
            });
            
            setTotalPages(Math.ceil(filtered.length / pageSize));
            return filtered;
          }

          setTotalPages(Math.ceil(newFiltered.length / pageSize));
          return newFiltered;
        });

        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("ไม่สามารถโหลดข้อมูลพนักงานได้");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, searchQuery, currentTeam]
  );
  // Handle infinite scroll
  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoading) {
      fetchEmployees(currentPage + 1);
    }
  }, [currentPage, totalPages, isLoading, fetchEmployees]);

  // Initial fetch
  useEffect(() => {
    fetchTeams();
  }, [currentTeam, fetchTeams]);

  useEffect(() => {
    fetchEmployees(1);
  }, []);

  // Filter employees based on search and current team
  useEffect(() => {
    if (!searchQuery && !currentTeam) {
      setFilteredEmployees(employees);
      return;
    }

    let filtered = employees;

    // Filter out team members if there's a current team
    if (currentTeam) {
      filtered = filtered.filter(
        (emp) => !currentTeam.members.some((member) => member.id === emp.id)
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((emp) => {
        const name =
          `${emp.employeeProfile.firstName} ${emp.employeeProfile.lastName}`.toLowerCase();
        const position = emp.employeeProfile.position?.toLowerCase() || "";
        const code = emp.employeeProfile.employeeCode.toLowerCase();

        return (
          name.includes(query) ||
          position.includes(query) ||
          code.includes(query)
        );
      });
    }

    setFilteredEmployees(filtered);
  }, [searchQuery, employees, currentTeam]);

  // Handle employee selection
  const handleEmployeeSelection = (id: string) => {
    setFilteredEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  // Handle select all employees
  const handleSelectAll = () => {
    const allSelected = filteredEmployees.every((emp) => emp.selected);
    setFilteredEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        selected: !allSelected,
      }))
    );
  };

  // Create new team
  const handleCreateTeam = async () => {
    if (newTeamName.trim() === "") return;

    try {
      const newTeam = await teamsApi.create({ name: newTeamName });
      setTeams([...teams, newTeam]);
      setCurrentTeam(newTeam);
      setNewTeamName("");
      setIsCreateTeamDialogOpen(false);
      toast.success("สร้างทีมเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("ไม่สามารถสร้างทีมได้");
    }
  };

  // Add selected employees to current team
  const handleAddToTeam = async (asLeader: boolean) => {
    if (!currentTeam) return;

    const selectedEmployees = filteredEmployees.filter((emp) => emp.selected);
    if (selectedEmployees.length === 0) return;

    const loadingToast = toast.loading("กำลังเพิ่มสมาชิก...");

    try {
      // Add all members in parallel
      await Promise.all(
        selectedEmployees.map((employee) =>
          teamsApi.addMember(currentTeam.id, employee.id, asLeader)
        )
      );

      // Get updated team data immediately
      const { data: freshTeams } = await teamsApi.list();
      setTeams(freshTeams);

      // Update current team
      const updatedTeam = freshTeams.find((team) => team.id === currentTeam.id);
      if (updatedTeam) {
        setCurrentTeam(updatedTeam);
      }

      // Clear selection
      setFilteredEmployees((prev) =>
        prev.map((emp) => ({ ...emp, selected: false }))
      );

      toast.dismiss(loadingToast);
      toast.success("เพิ่มสมาชิกเรียบร้อยแล้ว");
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error adding team members:", error);
      toast.error("ไม่สามารถเพิ่มสมาชิกได้");
    }
  };

  // Remove member from team
  const handleRemoveMember = async (membershipId: string) => {
    if (!currentTeam) return;

    try {
      const loadingToast = toast.loading("กำลังลบสมาชิก...");

      // Remove member
      await teamsApi.removeMember(currentTeam.id, membershipId);

      // Get updated team data immediately
      const updatedTeam = await teamsApi.get(currentTeam.id);

      // Update state
      setTeams((prev) => {
        const newTeams = prev.map((team) =>
          team.id === currentTeam.id ? updatedTeam : team
        );
        setCurrentTeam(updatedTeam);
        return newTeams;
      });

      toast.dismiss(loadingToast);
      toast.success("ลบสมาชิกเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("ไม่สามารถลบสมาชิกได้");
    }
  };

  // Open remove leader dialog
  const handleOpenRemoveLeaderDialog = (leader: TeamMember) => {
    setSelectedLeaderToRemove(leader);
    setIsRemoveLeaderDialogOpen(true);
  };

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Remove leader (either completely or change to regular member)
  const handleRemoveLeader = async (keepAsMember: boolean) => {
    if (!currentTeam || !selectedLeaderToRemove) return;

    try {
      if (keepAsMember) {
        // TODO: Add API endpoint to change role
        // For now, remove and re-add as member
        await teamsApi.removeMember(
          currentTeam.id,
          selectedLeaderToRemove.membershipId
        );
        await teamsApi.addMember(
          currentTeam.id,
          selectedLeaderToRemove.id,
          false
        );
      } else {
        // Remove completely
        await teamsApi.removeMember(
          currentTeam.id,
          selectedLeaderToRemove.membershipId
        );
      }

      // Refresh team data
      const updatedTeam = await teamsApi.get(currentTeam.id);
      setTeams(
        teams.map((team) => (team.id === currentTeam.id ? updatedTeam : team))
      );
      setCurrentTeam(updatedTeam);

      toast.success(
        keepAsMember
          ? "เปลี่ยนสถานะเป็นสมาชิกเรียบร้อยแล้ว"
          : "ลบสมาชิกเรียบร้อยแล้ว"
      );
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error(
        keepAsMember ? "ไม่สามารถเปลี่ยนสถานะได้" : "ไม่สามารถลบสมาชิกได้"
      );
    }

    // Close dialog
    setIsRemoveLeaderDialogOpen(false);
    setSelectedLeaderToRemove(null);
  };

  // Open permission dialog
  const handleOpenPermissionDialog = (member: TeamMember) => {
    setSelectedMemberForPermission(member);
    setSelectedPermission(member.permissionLevel);
    setIsPermissionDialogOpen(true);
  };

  // Update member permission
  const handleUpdatePermission = async () => {
    if (!currentTeam || !selectedMemberForPermission) return;

    try {
      const loadingToast = toast.loading("กำลังอัพเดทสิทธิ์...");

      // Remove and re-add with new role
      await teamsApi.removeMember(
        currentTeam.id,
        selectedMemberForPermission.membershipId
      );
      await teamsApi.addMember(
        currentTeam.id,
        selectedMemberForPermission.id,
        selectedPermission === "leader" || selectedPermission === "admin"
      );

      // Get fresh team data
      const updatedTeam = await teamsApi.get(currentTeam.id);

      // Update state
      setTeams((prev) => {
        const newTeams = prev.map((team) =>
          team.id === currentTeam.id ? updatedTeam : team
        );
        setCurrentTeam(updatedTeam);
        return newTeams;
      });

      toast.dismiss(loadingToast);
      toast.success("อัพเดทสิทธิ์เรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error updating member permission:", error);
      toast.error("ไม่สามารถอัพเดทสิทธิ์ได้");
    }

    // Close dialog
    setIsPermissionDialogOpen(false);
    setSelectedMemberForPermission(null);
  };

  // Filter employees by department
  const departments = [
    ...new Set(employees.map((emp) => emp.department || "ไม่ระบุแผนก")),
  ].sort();

  // Loading state UI
  if (isLoading) {
    return (
      <AppLayout
        title="เพิ่มพนักงานใหม่"
        description="จัดการทีมและกำหนดสิทธิ์การใช้งาน"
      >
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-red-700 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="เพิ่มพนักงานใหม่"
      description="จัดการทีมและกำหนดสิทธิ์การใช้งาน"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Management Section */}
        <div className="lg:col-span-1">
          <TeamManagement
            teams={teams}
            currentTeam={currentTeam}
            setCurrentTeam={setCurrentTeam}
            setIsCreateTeamDialogOpen={setIsCreateTeamDialogOpen}
            handleOpenRemoveLeaderDialog={handleOpenRemoveLeaderDialog}
            handleOpenPermissionDialog={handleOpenPermissionDialog}
            handleRemoveMember={handleRemoveMember}
            handleDeleteTeam={handleDeleteTeam}
          />
        </div>

        {/* Employee Selection Section */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">
                  รายชื่อพนักงาน
                </CardTitle>
                {currentTeam && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={selectedPermission}
                      onValueChange={(value: PermissionLevel) =>
                        setSelectedPermission(value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="เลือกสิทธิ์การใช้งาน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">แอดมินทีม</SelectItem>
                        <SelectItem value="leader">หัวหน้าทีม</SelectItem>
                        <SelectItem value="member">สมาชิก</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToTeam(true)}
                        className="bg-red-700 hover:bg-red-800 text-white"
                        size="sm"
                        disabled={
                          !filteredEmployees.some((emp) => emp.selected)
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่มเป็นหัวหน้าทีม
                      </Button>
                      <Button
                        onClick={() => handleAddToTeam(false)}
                        className="bg-red-700 hover:bg-red-800 text-white"
                        size="sm"
                        disabled={
                          !filteredEmployees.some((emp) => emp.selected)
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่มเป็นสมาชิกทีม
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="ค้นหาพนักงานหรือแผนก..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {" "}
              <EmployeeList
                filteredEmployees={paginatedEmployees}
                departments={departments}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleSelectAll={handleSelectAll}
                handleEmployeeSelection={handleEmployeeSelection}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CreateTeamDialog
        isOpen={isCreateTeamDialogOpen}
        setIsOpen={setIsCreateTeamDialogOpen}
        newTeamName={newTeamName}
        setNewTeamName={setNewTeamName}
        handleCreateTeam={handleCreateTeam}
      />

      <RemoveLeaderDialog
        isOpen={isRemoveLeaderDialogOpen}
        setIsOpen={setIsRemoveLeaderDialogOpen}
        memberName={selectedLeaderToRemove?.name || ""}
        onConfirm={() => handleRemoveLeader(false)}
      />

      <PermissionDialog
        isOpen={isPermissionDialogOpen}
        setIsOpen={setIsPermissionDialogOpen}
        selectedMember={selectedMemberForPermission}
        selectedPermission={selectedPermission}
        setSelectedPermission={setSelectedPermission}
        handleUpdatePermission={handleUpdatePermission}
      />
    </AppLayout>
  );
}
