const category1 = {
  _id: "10",
  name: "Real",
  slug: "real"
}

const product1 = {
  name: "Thing",
  slug: "1",
  description: "Thing's item",
  price: 1,
  _id: "5",
  quantity: 1,
  category: category1
}

const category2 = {
  _id: "20",
  name: "Fake",
  slug: "fake"
}

const product2 = {
  name: "Thing2",
  slug: "6",
  description: "Thing2's item",
  price: 2,
  _id: "2",
  quantity: 2,
  category: category2
}

const user1 = {
  name: "guy",
  email: "test@test.com",
  phone: "1111111",
  address: "Real Place BLK2 #55-1",
  password: "1234"
}

const user2 = {
  name: "other",
  email: "other@other.com",
  phone: "1231231",
  address: {},
  password: "2332"
}



export const mockUsers = [user1, user2]
export const mockProducts = [product1, product2]
export const mockOrders = [
  {
      status: "Not Process",
      buyer: {
          name: "Guy"
      },
      payment: {
          success: true
      },
      products: [product1, product2],
      createAt: "20240920"
  }
]
export const mockCategories = [category1, category2]