const { default: UsersList } = require("../components/UsersList");

const Battlegrounds = () => {


    return (
        <div>
          {console.log('Rendering UserManagement and UnitManager')}
          <h1>Battlegrounds</h1>
          <UsersList />
        </div>
      );
    };

    export default Battlegrounds;