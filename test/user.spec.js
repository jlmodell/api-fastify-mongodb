
describe("Testing the login method", () => {
    it("Make sure to receive a token in the response", () => {
        let response;
        fetch('http://localhost:9090/login', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                "email":"modell.jeff@me.com",
                "password":"secret"
            })            
        })
            .then(res => response = res.json())     

        expect(typeof response).toBe(Object)
    })
})