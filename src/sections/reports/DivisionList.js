import { useEffect, useState } from "react";
import {
  Card,
  Stack,
  Grid,
  Divider,
  Box,
  TextField,
  MenuItem,
  Button,
  Popover,
} from "@mui/material";

import MUIDataTable from "mui-datatables";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { LoadingButton } from "@mui/lab";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { updateDivisionByIdRoute } from "../../utils/apis";
import { set } from "date-fns";
import instance from "../../utils/axios";

const DivisionList = ({
  showAlert,
  divisionList,
  fetchedData,
  setFetchedData,
  refresh,
  setRefresh,
}) => {
  useEffect(() => {}, []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedValues, setSelectedValues] = useState({
    state_id: "",
    district_id: "",
    consistency_id: "",
    mandal_id: "",
    division_id: "",
    division_name: "",
  });

  const columns = [
    {
      label: "District Name",
    },
    {
      label: "Constituency Name",
    },
    {
      label: "Mandal Name",
    },
    {
      label: "Division Name",
    },

    {
      label: "Edit/Delete",
    },
  ];

  const options = {
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
  };

  const handleClick = (event, data) => {
    setAnchorEl(event.currentTarget);
    console.log("Divison data", data);

    // find consistency_id using mandal_id
    const consistency_id = fetchedData.mandal.find(
      (mandal) => mandal.mandal_pk === data.mandal_id
    ).consistency_id;

    //find district_id using consistency_id
    const district_id = fetchedData.consistency.find(
      (consistency) => consistency.consistency_pk === consistency_id
    ).district_pk;

    //find state_id using district_id
    const state_id = fetchedData.district.find(
      (district) => district.district_pk === district_id
    ).state_id;

    setSelectedValues((prevState) => ({
      ...prevState,
      state_id: state_id,
      district_id: district_id,
      consistency_id: consistency_id,
      mandal_id: data.mandal_id,
      division_id: data.division_pk,
      division_name: data.division_name,
    }));
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedValues({
      state_id: "",
      district_id: "",
      consistency_id: "",
      mandal_id: "",
      division_id: "",
      division_name: "",
    });
  };

  const onCancel = () => {
    setAnchorEl(null);
    setSelectedValues({
      state_id: "",
      district_id: "",
      consistency_id: "",
      mandal_id: "",
      division_id: "",
      division_name: "",
    });
  };

  // update details
  const handleSubmit = async () => {
    console.log("selectedValues", selectedValues);
    try {
      setIsLoading(true);
      const response = await instance.put(
        updateDivisionByIdRoute + selectedValues.division_id,
        {
          mandal_id: selectedValues.mandal_id,
          division_name: selectedValues.division_name,
        }
      );

      console.log("Division Updated", response.data.message);
      setIsLoading(false);
      showAlert({ text: "Division Updated Successfully", color: "success" });
      setRefresh((prevState) => !prevState);

      setSelectedValues({
        state_id: "",
        district_id: "",
        consistency_id: "",
        mandal_id: "",
        division_id: "",
        division_name: "",
      });
      setAnchorEl(null);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      showAlert({ text: "Something went wrong", color: "error" });
      setRefresh((prevState) => !prevState);
    }
  };

  const renderEditAndDelete = (data) => {
    // Create a popover for the mandal
    const open = Boolean(anchorEl);
    const id = open ? `simple-popover-${data.mandal_pk}` : undefined;

    return (
      <Box>
        <Button
          aria-describedby={id}
          variant="contained"
          onClick={(e) => {
            handleClick(e, data);
          }}
        >
          <EditNoteIcon />
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "center",
          }}
        >
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid
                item
                xs={12}
                md={6}
                lg={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <TextField
                  size="small"
                  label="Select State"
                  fullWidth
                  select
                  value={selectedValues.state_id}
                  onChange={(e) => {
                    setSelectedValues((prevState) => ({
                      ...prevState,
                      state_id: e.target.value,
                      district_id: "",
                      consistency_id: "",
                      mandal_id: "",
                    }));
                  }}
                >
                  {fetchedData.states.map((state) => {
                    return (
                      <MenuItem value={state.state_pk}>
                        {state.state_name}
                      </MenuItem>
                    );
                  })}
                </TextField>
                <TextField
                  size="small"
                  label="Select District"
                  fullWidth
                  select
                  value={selectedValues.district_id}
                  onChange={(e) => {
                    setSelectedValues((prevState) => ({
                      ...prevState,
                      district_id: e.target.value,
                      consistency_id: "",
                      mandal_id: "",
                    }));
                  }}
                >
                  {/* filter districk based on state_id */}
                  {fetchedData.district
                    .filter(
                      (district) =>
                        district.state_id === selectedValues.state_id
                    )
                    .map((district) => {
                      return (
                        <MenuItem value={district.district_pk}>
                          {district.district_name}
                        </MenuItem>
                      );
                    })}
                </TextField>
                <TextField
                  size="small"
                  label="Select Constituency"
                  fullWidth
                  select
                  value={selectedValues.consistency_id}
                  onChange={(e) => {
                    setSelectedValues((prevState) => ({
                      ...prevState,
                      consistency_id: e.target.value,
                      mandal_id: "",
                    }));
                  }}
                >
                  {/* filter constituency based on district_id */}
                  {fetchedData.consistency
                    .filter(
                      (consistency) =>
                        consistency.district_pk === selectedValues.district_id
                    )
                    .map((consistency) => {
                      return (
                        <MenuItem value={consistency.consistency_pk}>
                          {consistency.consistency_name}
                        </MenuItem>
                      );
                    })}
                </TextField>
                <TextField
                  size="small"
                  label="Select Mandal"
                  fullWidth
                  select
                  value={selectedValues.mandal_id}
                  onChange={(e) => {
                    setSelectedValues((prevState) => ({
                      ...prevState,
                      mandal_id: e.target.value,
                    }));
                  }}
                >
                  {/* filter mandal based on consistency_id */}
                  {fetchedData.mandal
                    .filter(
                      (mandal) =>
                        mandal.consistency_id === selectedValues.consistency_id
                    )
                    .map((mandal) => {
                      return (
                        <MenuItem value={mandal.mandal_pk}>
                          {mandal.mandal_name}
                        </MenuItem>
                      );
                    })}
                </TextField>

                <TextField
                  size="small"
                  label="Division Name"
                  fullWidth
                  value={selectedValues.division_name}
                  onChange={(e) => {
                    setSelectedValues((prevState) => ({
                      ...prevState,
                      division_name: e.target.value,
                    }));
                  }}
                />
                <LoadingButton
                  loading={isLoading}
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    padding: "15px",
                  }}
                >
                  Update
                </LoadingButton>
                <LoadingButton
                  onClick={onCancel}
                  variant="contained"
                  sx={{
                    padding: "10px",
                    backgroundColor: "#f44336",
                  }}
                >
                  Cancel
                </LoadingButton>
              </Grid>
            </Grid>
          </Card>
        </Popover>

        {/* <DeleteForeverIcon
          sx={{
            color: "#f44336",
            marginLeft: "10px",
          }}
        /> */}
      </Box>
    );
  };

  const formartedData = fetchedData.division.map((division) => {
    return [
      division.district_name || "District",
      division.consitency_name || "Constituency",
      division.mandal_name || "Mandal",
      division.division_name || "Division",
      renderEditAndDelete(division),
    ];
  });

  return (
    <Card elevation={1}>
      <Stack>
        <Divider />

        <MUIDataTable
          title=""
          columns={columns}
          data={formartedData}
          options={options}
        />
      </Stack>
    </Card>
  );
};

const mapStateToProps = (state) => {
  return {
    batches: state.common,
    students: state.management,
  };
};

export default connect(mapStateToProps, {
  showAlert,
})(DivisionList);
