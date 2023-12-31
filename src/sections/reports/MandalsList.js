import { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Stack,
  Grid,
  Switch,
  Divider,
  Box,
  Chip,
  TextField,
  FormControlLabel,
  Popover,
  Button,
  MenuItem,
} from "@mui/material";
import { CheckBox } from "@mui/icons-material";
import MUIDataTable from "mui-datatables";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { LoadingButton } from "@mui/lab";
import ViewUserPage from "../../pages/ViewUserPage";
import Sachivalayam from "../../pages/Sachivalayam";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { set } from "date-fns";
import { updateMandalByIdRoute } from "../../utils/apis";
import instance from "../../utils/axios";

const MandalsList = ({
  showAlert,
  mandalsList,
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
    mandal_name: "",
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
    // console.log("data", data);

    //find district_id using consistency_id
    const district_id = fetchedData.consistency.find(
      (consistency) => consistency.consistency_pk === data.consistency_id
    ).district_pk;

    //find state_id using district_id
    const state_id = fetchedData.district.find(
      (district) => district.district_pk === district_id
    ).state_id;

    setSelectedValues((prevState) => ({
      ...prevState,
      state_id: state_id,
      district_id: district_id,
      consistency_id: data.consistency_id,
      mandal_id: data.mandal_pk,
      mandal_name: data.mandal_name,
    }));
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedValues({
      state_id: "",
      district_id: "",
      consistency_id: "",
      mandal_id: "",
      mandal_name: "",
    });
  };

  const onCancel = () => {
    setAnchorEl(null);
    setSelectedValues({
      state_id: "",
      district_id: "",
      consistency_id: "",
      mandal_id: "",
      mandal_name: "",
    });
  };

  // update details
  const handleSubmit = async () => {
    // console.log("selectedValues", selectedValues);

    try {
      setIsLoading(true);
      const response = await instance.put(
        updateMandalByIdRoute + selectedValues.mandal_id,
        {
          consistency_id: selectedValues.consistency_id,
          mandal_name: selectedValues.mandal_name,
        }
      );
  
      setIsLoading(false);
      showAlert({ text: "Mandal Updated Successfully", color: "success" });
      setRefresh((prevState) => !prevState);
      setSelectedValues({
        state_id: "",
        district_id: "",
        consistency_id: "",
        mandal_id: "",
        mandal_name: "",
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
                  label="Mandal Name"
                  fullWidth
                  value={selectedValues.mandal_name}
                  onChange={(e) => {
                    setSelectedValues((prevState) => ({
                      ...prevState,
                      mandal_name: e.target.value,
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

  const formartedData = fetchedData.mandal.map((mandal) => {
    return [
      mandal.district_name || "District",
      mandal.consistency_id,
      mandal.mandal_name,
      renderEditAndDelete(mandal),
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
})(MandalsList);
