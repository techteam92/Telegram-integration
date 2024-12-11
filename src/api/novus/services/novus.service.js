const axios = require('axios');
const userService = require('../../user/service/user.service');
const LOGIN_URL = 'https://dx.envifx.com/dxsca-web/login';
const LOGOUT_URL = 'https://dx.envifx.com/dxsca-web/logout';
const ORDER_URL = 'https://dx.envifx.com/dxsca-web/accounts';
const USERS_URL = 'https://dx.envifx.com/dxsca-web/users';

const loginUser = async (username, domain, password) => {
  try {
    const response = await axios.post(
      LOGIN_URL,
      {
        username,
        domain,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    const { sessionToken } = response.data;
    return sessionToken;
  } catch (error) {
    console.error(error.response.data || error.message);
    if (error.response) {
      throw new Error(`Authorization failed: ${error.response.data.description}`);
    } else {
      throw new Error('Error connecting to login service');
    }
  }
};

const logoutUser = async (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('DXAPI ')) {
    throw new Error('Authorization token is required and must be in the format "DXAPI <session token>"');
  }

  const sessionToken = authorizationHeader.replace('DXAPI ', '');

  try {
    const response = await axios.post(
      LOGOUT_URL,
      {},
      {
        headers: {
          Authorization: `DXAPI ${sessionToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    return {
      status: 'OK',
      message: 'Logout successful',
    };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Authorization required: Invalid or missing session token');
      }
      throw new Error(`Logout failed: ${error.response.data.description || 'Unknown error'}`);
    } else {
      throw new Error('Error connecting to the logout service');
    }
  }
};

const submitOrder = async (account, authorizationHeader, orderRequest) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('DXAPI')) {
    throw new Error('Authorization token is required in the format "DXAPI <session token>", timestamp=<timestamp>, hash="<HMAC hash>"');
  }

  const url = `${ORDER_URL}/${encodeURIComponent(account)}/orders`;

  try {
    const response = await axios.post(url, orderRequest, {
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return {
      orderId: response.data.orderId,
      updateOrderId: response.data.updateOrderId,
    };
  } catch (error) {
    if (error.response) {
      const errorCode = error.response.data.errorCode || 'Unknown';
      const description = error.response.data.description || 'Unknown';
      const statusCode = error.response.status;

      switch (statusCode) {
        case 400:
          throw new Error(`Malformed request: ${errorCode} - ${description}`);
        case 401:
          throw new Error(`Authorization required: ${errorCode} - ${description}`);
        case 404:
          throw new Error(`Entity not found: ${errorCode} - ${description}`);
        case 409:
          throw new Error(`Entity conflict: ${errorCode} - ${description}`);
        default:
          throw new Error(`Request failed: ${errorCode} - ${description}`);
      }
    } else {
      throw new Error('Error connecting to the order service');
    }
  }
};

const editOrder = async (account, authorizationHeader, orderRequest) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('DXAPI ')) {
    throw new Error(
      'Authorization token is required in the format "DXAPI <session token>" or "DXAPI principal="<API principal>", timestamp=<timestamp>, hash="<HMAC hash>"',
    );
  }

  const url = `${ORDER_URL}/${encodeURIComponent(account)}/orders`;

  try {
    const response = await axios.put(url, orderRequest, {
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return {
      status: 'OK',
      message: 'Order updated successfully',
    };
  } catch (error) {
    if (error.response) {
      const errorCode = error.response.data.errorCode || 'Unknown';
      const description = error.response.data.description || 'Unknown error';
      const statusCode = error.response.status;

      switch (statusCode) {
        case 400:
          throw new Error(`Malformed request: ${errorCode} - ${description}`);
        case 401:
          throw new Error(`Authorization required: ${errorCode} - ${description}`);
        case 404:
          throw new Error(`Entity not found: ${errorCode} - ${description}`);
        default:
          throw new Error(`Request failed: ${errorCode} - ${description}`);
      }
    } else {
      throw new Error('Error connecting to the edit order service');
    }
  }
};

const getOpenOrders = async (account, authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('DXAPI ')) {
    throw new Error(
      'Authorization token is required in the format "DXAPI <session token>" or "DXAPI principal="<API principal>", timestamp=<timestamp>, hash="<HMAC hash>"',
    );
  }

  const url = `${ORDER_URL}/${encodeURIComponent(account)}/orders`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: authorizationHeader,
        Accept: 'application/json',
      },
    });

    return {
      status: 'OK',
      orders: response.data.orders,
      nextPageTransactionTime: response.data.nextPageTransactionTime,
    };
  } catch (error) {
    if (error.response) {
      const errorCode = error.response.data.errorCode || 'Unknown';
      const description = error.response.data.description || 'Unknown error';
      const statusCode = error.response.status;

      switch (statusCode) {
        case 400:
          throw new Error(`Malformed request: ${errorCode} - ${description}`);
        case 401:
          throw new Error(`Authorization required: ${errorCode} - ${description}`);
        default:
          throw new Error(`Request failed: ${errorCode} - ${description}`);
      }
    } else {
      throw new Error('Error connecting to the open orders service');
    }
  }
};

const getOrderHistory = async (account, authorizationHeader, filters = {}) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('DXAPI ')) {
    throw new Error(
      'Authorization token is required in the format "DXAPI <session token>" or "DXAPI principal="<API principal>", timestamp=<timestamp>, hash="<HMAC hash>"',
    );
  }
  const url = `${ORDER_URL}/${encodeURIComponent(account)}/orders/history`;

  const defaultParams = {
    limit: 100,
    page: 1,
    pageSize: 50,
  };

  const params = { ...defaultParams, ...filters };

  try {
    const response = await axios.post(url, null, {
      headers: {
        Authorization: authorizationHeader,
        Accept: 'application/json',
      },
      params,
    });

    return {
      status: 'OK',
      orders: response.data.orders,
      nextPageTransactionTime: response.data.nextPageTransactionTime,
    };
  } catch (error) {
    if (error.response) {
      const errorCode = error.response.data.errorCode || 'Unknown';
      const description = error.response.data.description || 'Unknown error';
      const statusCode = error.response.status;

      switch (statusCode) {
        case 400:
          throw new Error(`Malformed request: ${errorCode} - ${description}`);
        case 401:
          throw new Error(`Authorization required: ${errorCode} - ${description}`);
        default:
          throw new Error(`Request failed: ${errorCode} - ${description}`);
      }
    } else {
      throw new Error('Error connecting to the order history service');
    }
  }
};

const getUsers = async (authorizationHeader, filters = {}) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('DXAPI ')) {
    throw new Error(
      'Authorization token is required in the format "DXAPI <session token>" or "DXAPI principal="<API principal>", timestamp=<timestamp>, hash="<HMAC hash>"',
    );
  }

  const defaultParams = {
    limit: 100,
    startFrom: 0,
  };
  const params = { ...defaultParams, ...filters };

  try {
    const response = await axios.get(USERS_URL, {
      headers: {
        Authorization: authorizationHeader,
        Accept: 'application/json',
      },
      params,
    });

    return {
      status: 'OK',
      userDetails: response.data.userDetails,
    };
  } catch (error) {
    if (error.response) {
      const errorCode = error.response.data.errorCode || 'Unknown';
      const description = error.response.data.description || 'Unknown error';
      const statusCode = error.response.status;

      switch (statusCode) {
        case 400:
          throw new Error(`Malformed request: ${errorCode} - ${description}`);
        case 401:
          throw new Error(`Authorization required: ${errorCode} - ${description}`);
        default:
          throw new Error(`Request failed: ${errorCode} - ${description}`);
      }
    } else {
      throw new Error('Error connecting to the user details service');
    }
  }
};

module.exports = {
  loginUser,
  logoutUser,
  submitOrder,
  editOrder,
  getOpenOrders,
  getOrderHistory,
  getUsers,
};
