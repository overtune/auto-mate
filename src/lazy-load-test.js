function createForm() {
 const formHolder = document.createElement('div');

  formHolder.innerHTML = `
    <form class="form" id="lazyform">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" />
      <label for="email">E-mail</label>
      <input type="text" id="email" name="email" />
      <button type="submit">Send</button>
    </form>
`;
  document.body.appendChild(formHolder);
}

setTimeout(() => {
  createForm();
}, 5000);
