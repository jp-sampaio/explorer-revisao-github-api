import { GithubSearch } from "./githubSearch.js";

// Aqui recebe os dados da aplicação
class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites", JSON.stringify(this.entries));
  }

  async add(userName) {
    try {
      const userExists = this.entries.find( entry => entry.login === userName);

      if ( userExists ) {
        throw new Error("O usúario já foi cadastrado!");
      }

      const user = await GithubSearch.search(userName);

      if ( user.login === undefined ) {
        throw new Error("Usúario não encontrado!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();

    } catch(error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter( entry => { entry.login !== user.login });
    
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

// Aqui vai a visualização da aplicação
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root); 
    this.tBody = this.root.querySelector("table tbody");
    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".button");

    addButton.onclick = () => {
      const { value } = this.root.querySelector("#user");

      this.add(value);
    }
  }

  update() {
    this.removeAllTr();

    this.entries.forEach( user => {
      const row = this.createRow();

      row.querySelector("img").src = `https://github.com/${user.login}.png`;
      row.querySelector("img").alt = `Imagem de ${user.name}`;
      row.querySelector("a").href = `https://github.com/${user.login}`;
      row.querySelector("a p").textContent = user.name;
      row.querySelector("a span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja excluir este usúario?");

        if( isOk ) {
          this.delete(user);
        }
      }

      this.tBody.append(row);
    })
  }

  createRow() {
    const tr = document.createElement("tr");
    
    tr.innerHTML = `
      <td class="info-user">
        <img src="" alt="" class="profile-photo">
        <a href="" target="_blank">
          <p class="name"></p>
          <span class="user-name"></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="remove">&Cross;</button>
      </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tBody.querySelectorAll("tr")
      .forEach( (tr) => { 
        tr.remove();
      } );
  }
}