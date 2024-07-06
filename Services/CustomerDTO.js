const CusDto = (cust) => {
  const cusData = {
    _id: cust._id,
    fullname: cust.fullname,
    email: cust.email,
    password: cust.password,
    cnic: cust.cnic,
    contact: cust.contact,
    address: cust.address,
    shop: cust.shop,
    discount: cust.discount,
    paid: cust.paid,
    remaining: cust.remaining,
    total: cust.total,
  };
  return cusData;
};

module.exports = CusDto;
