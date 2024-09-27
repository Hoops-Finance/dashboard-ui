export const customTableStyles = (theme: string) => ({
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
      textAlign: "center" as const
    }
  },
  rows: {
    style: {
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#000000"
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
