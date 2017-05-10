// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
process.env.PORT = process.env.PORT || 3000; // for local debugging
process.env.dataDirectory = '../../App_Data';

require('azure-mobile-services');
