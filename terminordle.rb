# typed: false
require "language/node"

# homebrew
class Terminordle < Formula
  desc "Multiplayer wordle in the terminal"
  homepage "https://github.com/HP4k1h5/terminordle/"
  url "https://registry.npmjs.org/@hp4k1h5/terminordle/-/terminordle-0.1.5.tgz"
  sha256 "37d156d92a8496c6f8a4c0f4a711540648c0f928310a046c15287f3c241b00e7"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "true"
  end
end
