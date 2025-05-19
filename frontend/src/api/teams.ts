import axios from '../axiosConfig';
import { Team, TeamMember } from '@/components/types/team';

export const teamsApi = {
  getTeams: async () => {
    const response = await axios.get('/api/teams');
    return response.data;
  },

  createTeam: async (teamData: Partial<Team>) => {
    const response = await axios.post('/api/teams', teamData);
    return response.data;
  },

  updateTeam: async (teamId: string, teamData: Partial<Team>) => {
    const response = await axios.put(`/api/teams/${teamId}`, teamData);
    return response.data;
  },

  deleteTeam: async (teamId: string) => {
    const response = await axios.delete(`/api/teams/${teamId}`);
    return response.data;
  },

  getTeamMembers: async (teamId: string) => {
    const response = await axios.get(`/api/teams/${teamId}/members`);
    return response.data;
  },

  updateTeamMember: async (teamId: string, memberId: string, memberData: Partial<TeamMember>) => {
    const response = await axios.put(`/api/teams/${teamId}/members/${memberId}`, memberData);
    return response.data;
  },

  removeTeamMember: async (teamId: string, memberId: string) => {
    const response = await axios.delete(`/api/teams/${teamId}/members/${memberId}`);
    return response.data;
  }
};
