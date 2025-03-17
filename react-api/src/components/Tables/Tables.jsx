import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authcontext";
import "./Tables.css";

const Tables = () => {
    const [tablesData, setTablesData] = useState([]);
    const [error, setError] = useState("");
    const [selectedColumns, setSelectedColumns] = useState({});
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const connectionInfo = sessionStorage.getItem("dbConnection");
        if (!connectionInfo) {
            navigate("/dbConnect");
            return;
        }
        fetchTableData();
    }, [navigate]);

    const fetchTableData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/tables");
            const data = await response.json();

            if (data.tablesData) {
                setTablesData(data.tablesData);
                // Initialize selected columns state
                const initialSelection = {};
                data.tablesData.forEach((table) => {
                    initialSelection[table.tableName] = {};
                    table.columns.forEach((column) => {
                        initialSelection[table.tableName][column.name] = false;
                    });
                });
                setSelectedColumns(initialSelection);
            } else {
                setError(data.message || "Failed to fetch table data");
            }
        } catch (error) {
            setError("Error fetching table data");
        }
    };

    const handleColumnSelect = (tableName, columnName) => {
        setSelectedColumns((prev) => ({
            ...prev,
            [tableName]: {
                ...prev[tableName],
                [columnName]: !prev[tableName][columnName],
            },
        }));
    };

    const handleGenerateAPI = async () => {
        // Filter only selected columns
        const selectedData = {};
        Object.keys(selectedColumns).forEach((tableName) => {
            const columns = Object.entries(selectedColumns[tableName])
                .filter(([_, isSelected]) => isSelected)
                .map(([columnName]) => columnName);

            if (columns.length > 0) {
                selectedData[tableName] = columns;
            }
        });

        try {
            const response = await fetch(
                "http://localhost:5000/api/createApi",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ selectedColumns: selectedData }),
                }
            );
            const result = await response.json();
            if (result.success) {
                alert("API generated successfully!");
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError("Error generating API");
        }
    };

    return (
        <div className="table-data-container">
            <h2>Select Columns for API Generation</h2>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="tables-data-list">
                    {tablesData.length === 0 ? (
                        <p>No tables found in the database</p>
                    ) : (
                        tablesData.map((table, index) => (
                            <div key={index} className="table-section">
                                <div className="table-scroll">
                                    <table>
                                        <tbody>
                                            <tr className="table-name-row">
                                                <td
                                                    colSpan={
                                                        table.columns.length
                                                    }
                                                >
                                                    {table.tableName}
                                                </td>
                                            </tr>
                                            <tr>
                                                {table.columns.map(
                                                    (column, colIndex) => (
                                                        <th
                                                            key={colIndex}
                                                            className={`column-header ${
                                                                selectedColumns[
                                                                    table
                                                                        .tableName
                                                                ]?.[column.name]
                                                                    ? "selected"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                handleColumnSelect(
                                                                    table.tableName,
                                                                    column.name
                                                                )
                                                            }
                                                        >
                                                            {column.name}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            <div className="navigation-buttons">
                <button onClick={handleGenerateAPI}>Generate API</button>
            </div>
            <button onClick={logout} className="logout-button">
                Logout
            </button>
        </div>
    );
};

export default Tables;
