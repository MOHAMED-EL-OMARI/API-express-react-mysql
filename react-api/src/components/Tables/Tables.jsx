import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authcontext";
import "./Tables.css";
import DatabaseDisconnect from '../DatabaseDisconnect/DatabaseDisconnect';

const Tables = () => {
    const [tablesData, setTablesData] = useState([]);
    const [error, setError] = useState("");
    const [selectedColumns, setSelectedColumns] = useState({});
    const [activeTable, setActiveTable] = useState(null);
    const navigate = useNavigate();
    const { token, user, logout } = useContext(AuthContext);

    useEffect(() => {
        const connectionInfo = sessionStorage.getItem("dbConnection");
        if (!connectionInfo) {
            navigate("/database");
            return;
        }
        if (!token) {
            navigate("/");
            return;
        }
        fetchTableData();
    }, [navigate, token]);

    const fetchTableData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/tables", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                logout();
                return;
            }

            const data = await response.json();

            if (data.tablesData) {
                setTablesData(data.tablesData);
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
        // If no active table or this is the active table
        if (!activeTable || activeTable === tableName) {
            setActiveTable(tableName);
            setSelectedColumns((prev) => ({
                ...prev,
                [tableName]: {
                    ...prev[tableName],
                    [columnName]: !prev[tableName][columnName],
                },
            }));
            
            // If all columns are deselected, clear the active table
            const updatedSelection = {
                ...selectedColumns,
                [tableName]: {
                    ...selectedColumns[tableName],
                    [columnName]: !selectedColumns[tableName][columnName]
                }
            };
            
            const hasSelectedColumns = Object.values(updatedSelection[tableName]).some(value => value);
            if (!hasSelectedColumns) {
                setActiveTable(null);
            }
        }
    };

    // Add a function to reset selection
    const resetSelection = () => {
        setActiveTable(null);
        // Reset all selections to false
        const resetSelection = {};
        Object.keys(selectedColumns).forEach(tableName => {
            resetSelection[tableName] = {};
            Object.keys(selectedColumns[tableName]).forEach(columnName => {
                resetSelection[tableName][columnName] = false;
            });
        });
        setSelectedColumns(resetSelection);
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
                        "Authorization": `Bearer ${token}` // Add authorization header
                    },
                    body: JSON.stringify({ selectedColumns: selectedData }),
                }
            );

            if (response.status === 401 || response.status === 403) {
                logout();
                return;
            }

            const result = await response.json();
            if (result.success) {
                alert("API generated successfully!");
                resetSelection(); // Reset selection after successful API generation
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
                                    <table className={activeTable && activeTable !== table.tableName ? "disabled-table" : ""}>
                                        <tbody>
                                            <tr className="table-name-row">
                                                <td
                                                    colSpan={
                                                        table.columns.length
                                                    }
                                                >
                                                    {table.tableName}
                                                    {activeTable === table.tableName && (
                                                        <span className="active-table-indicator"> (Active)</span>
                                                    )}
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
                                                            } ${
                                                                activeTable && activeTable !== table.tableName
                                                                    ? "disabled"
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
                <DatabaseDisconnect />
            </div>
            <button onClick={logout} className="logout-button">
                Logout
            </button>
        </div>
    );
};

export default Tables;
