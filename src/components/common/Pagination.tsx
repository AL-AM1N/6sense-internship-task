interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: Props) => {
  const pagination: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pagination.push(i);
    }
  } else {
    if (currentPage <= 4) {
      pagination.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pagination.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pagination.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* PREVIOUS */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="cursor-pointer px-3 py-1 hover:bg-gray-100"
        >
          {"<"}
        </button>
      )}

      {/* NUMBERS */}
      {pagination.map((item, index) =>
        item === "..." ? (
          <span key={index}>...</span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(Number(item))}
            className={`cursor-pointer px-3 py-1 hover:bg-blue-100 ${
              currentPage === item
                ? "text-blue-600"
                : ""
            }`}
          >
            {item}
          </button>
        ),
      )}

      {/* NEXT */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="cursor-pointer px-3 py-1 hover:bg-gray-100"
        >
          {">"}
        </button>
      )}
    </div>
  );
};

export default Pagination;