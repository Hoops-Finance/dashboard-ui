export const customTableStyles = (theme: string) => ({
  tableWrapper: {
    style: {
      overflowX: "auto" as const, // Ensure the literal type 'auto' is used
      display: "block"
    }
  },
  headRow: {
    style: {
      backgroundColor: theme === "dark" ? "#374151" : "#f9fafb"
    }
  },
  headCells: {
    style: {
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#000000",
      fontSize: "16px",
      fontWeight: "bold",
      textAlign: "center" as const,
      whiteSpace: "nowrap"
    }
  },
  rows: {
    style: {
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#000000",
      fontSize: "14px",
      wordWrap: "break-word" as const // Correct literal type
    }
  },
  cells: {
    style: {
      padding: "8px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  },
  pagination: {
    style: {
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#000000",
      fontSize: "14px"
    }
  },
  pageButtonsStyle: {
    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
    color: theme === "dark" ? "#ffffff" : "#000000",
    "&:hover": {
      backgroundColor: theme === "dark" ? "#B7A7E5" : "#e5e7eb"
    },
    fontSize: "18px"
  }
});
