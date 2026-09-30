package com.aibus.dto.bus;

import java.util.List;

public class GdsDeckResponse {
    // LOWER or UPPER
    private String name;
    private int rows;
    private int columns;
    private List<GdsSeatResponse> seats;

    public GdsDeckResponse() {
    }

    public GdsDeckResponse(String name, int rows, int columns, List<GdsSeatResponse> seats) {
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        this.seats = seats;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getRows() {
        return rows;
    }

    public void setRows(int rows) {
        this.rows = rows;
    }

    public int getColumns() {
        return columns;
    }

    public void setColumns(int columns) {
        this.columns = columns;
    }

    public List<GdsSeatResponse> getSeats() {
        return seats;
    }

    public void setSeats(List<GdsSeatResponse> seats) {
        this.seats = seats;
    }
}
