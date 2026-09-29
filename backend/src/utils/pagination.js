export const getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const sort = query.sort || "createdAt";
  const order = query.order === "asc" ? "asc" : "desc";

  return { page, limit, skip, sort, order };
};

export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
