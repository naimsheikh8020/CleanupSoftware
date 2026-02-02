import { baseApi } from "@/redux/api/baseApi";

export const buildingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => "/locations/overview/",
      providesTags: ["Building"],
    }),
    getBuildings: builder.query({
      query: (page = 1) => `/buildings/?page=${page}`,
      providesTags: ["Building"],
    }),
    getBuildingCoordinates: builder.query({
      query: () => "/map/data/",
      providesTags: ["Building"],
    }),
    getBuilidingBySearch: builder.query({
      query: (search: string) => ({
        url: "/buildings/",
        params: { search },
      }),
      providesTags: ["Building"],
    }),
    getBuildingById: builder.query({
      query: (id) => `/buildings/${id}`,
      providesTags: (id) => [{ type: "Building", id }],
    }),
    getBuildingsByRegion: builder.query({
      query: (region) => `/buildings/region/${region}`,
      providesTags: ["Building"],
    }),
    getApartments: builder.query({
      query: (buildingId) => `/apartments/?building_id=${buildingId}`,
      providesTags: ["Apartment"],
    }),
    createBuilding: builder.mutation({
      query: (data) => ({
        url: "/buildings/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Building"],
    }),
    updateBuilding: builder.mutation({
      query: ({ id, data }) => ({
        url: `/buildings/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Building", "Apartment"],
    }),
    deleteBuilding: builder.mutation({
      query: (id) => ({
        url: `/buildings/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Building"],
    }),
    createApartment: builder.mutation({
      query: (data) => ({
        url: "/apartments/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Apartment"],
    }),
  }),
});

export const {
  useGetBuildingsQuery,
  useGetBuildingCoordinatesQuery,
  useGetBuildingByIdQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useCreateApartmentMutation,
  useDeleteBuildingMutation,
  useGetStatsQuery,
  useGetBuilidingBySearchQuery,
  useGetBuildingsByRegionQuery,
  useGetApartmentsQuery,
} = buildingApi;
