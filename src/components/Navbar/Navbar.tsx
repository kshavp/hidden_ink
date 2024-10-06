const Navbar = () => {
  return (
    <nav className="text-white pt-8 md:text-2xl font-semibold">
      <ul className="flex justify-around items-center space-x-10">
        <li className="hover:text-gray-300">
          <a href="https://github.com/kshavp/hidden_ink" target="_blank">
            Repository
          </a>
        </li>
        <li className="hover:text-gray-300">
          <a
            target="_blank"
            href="https://www.kaspersky.com/resource-center/definitions/what-is-steganography#:~:text=random%20character%20sequences.-,Image%20steganography,hide%20information%20inside%20an%20image."
          >
            Resources
          </a>
        </li>
        <li className="hover:text-gray-300">
          <a
            target="_blank"
            href="https://www.kaspersky.com/resource-center/definitions/what-is-steganography"
          >
            Steganography
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
