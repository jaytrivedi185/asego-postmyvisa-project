import apiClient from './axios';

export const getCategoryList = async () => {
  const { data } = await apiClient.get('/ext/b2b/v1/category');
  return data;
};

export const getSellingPlans = async (partnerId) => {
  const { data } = await apiClient.get(`/ext/b2b/v1/plan/masterDetails/${partnerId}`);
  return data;
};
