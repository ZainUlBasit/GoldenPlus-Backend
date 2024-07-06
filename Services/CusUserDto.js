const CusUserDto = (customer) => {
  const customerdata = {
    _id: customer._id,
    fullname: customer.fullname,
    email: customer.email,
    shop: customer.shop,
    discount: customer.discount,
    paid: customer.paid,
    remaining: customer.remaining,
    total: customer.total,
  };
  return customerdata;
};

module.exports = CusUserDto;
