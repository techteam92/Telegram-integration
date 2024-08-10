const paginate = (page, limit) => {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSize = limit ? parseInt(limit, 10) : 10;
  
    const skip = (pageNumber - 1) * pageSize;
    const paginationPipeline = [
      { $skip: skip },
      { $limit: pageSize }
    ];
  
    return { paginationPipeline, pageSize, pageNumber };
  };

module.exports = paginate