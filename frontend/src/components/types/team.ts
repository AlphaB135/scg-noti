export type PermissionLevel = "admin" | "leader" | "member"

export interface EmployeeProfile {
  employeeCode: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  position?: string;
}

export interface Employee {
  id: string;
  email: string;
  status: string;
  role: string;
  employeeProfile: EmployeeProfile;
  selected?: boolean;
  name?: string;
  department?: string;
}

export interface TeamMember {
  id: string;
  membershipId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  isLeader: boolean;
  permissionLevel: PermissionLevel;
  role: string;
  avatar?: string;
}

// Raw API response interface for TeamMember
export interface TeamMemberApiResponse {
  id: string;
  teamId: string;
  employeeId: string;
  role: 'TEAM_LEAD' | 'MEMBER';
  joinDate: string;
  user: {
    id: string;
    email: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
      department: string;
      position: string;
      email: string;
    };
  };
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

// Utility function to transform API response to frontend TeamMember interface
export const transformTeamMemberApiResponse = (apiResponse: TeamMemberApiResponse): TeamMember => ({
  id: apiResponse.user.id,
  membershipId: apiResponse.id,
  name: `${apiResponse.user.employeeProfile.firstName} ${apiResponse.user.employeeProfile.lastName}`,
  department: apiResponse.user.employeeProfile.department,
  position: apiResponse.user.employeeProfile.position,
  email: apiResponse.user.employeeProfile.email,
  isLeader: apiResponse.role === 'TEAM_LEAD',
  permissionLevel: apiResponse.role === 'TEAM_LEAD' ? 'leader' : 'member',
  role: apiResponse.role === 'TEAM_LEAD' ? 'หัวหน้างาน' : 'พนักงาน',
  avatar: '/placeholder.svg'
});

// Permission descriptions
export const permissionDescriptions = {
  admin: "จัดการพนักงานและทีมทั้งหมดได้",
  leader: "เพิ่ม/ลบสมาชิกในทีมตัวเองได้",
  member: "แก้ไขข้อมูลทีมได้",
}

// Permission badge colors
export const permissionColors = {
  admin: "bg-red-700 hover:bg-red-800",
  leader: "bg-amber-600 hover:bg-amber-700",
  member: "bg-blue-600 hover:bg-blue-700",
}

// Role badge colors
export const roleColors = {
  หัวหน้างาน: "bg-purple-600 hover:bg-purple-700",
  พนักงาน: "bg-green-600 hover:bg-green-700",
}
