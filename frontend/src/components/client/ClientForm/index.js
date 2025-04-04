import React from 'react';
import { Box, Grid } from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import TextField from '../../common/Input/TextField';
import PrimaryButton from '../../common/Button/PrimaryButton';
import { clientSchema } from '../../../utils/validators';

const ClientForm = ({ initialValues, onSubmit, buttonText }) => {
  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    validationSchema: clientSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="name"
            label="Client Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name="phone"
            label="Phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && formik.errors.phone}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="address"
            label="Address"
            multiline
            rows={3}
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && formik.errors.address}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <PrimaryButton type="submit" disabled={!formik.isValid || formik.isSubmitting}>
              {buttonText || 'Save Client'}
            </PrimaryButton>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

ClientForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};

export default ClientForm;