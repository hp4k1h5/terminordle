# typed: false
require "language/node"

# homebrew
class Terminordle < Formula
  desc "Multiplayer wordle in the terminal"
  homepage "https://github.com/HP4k1h5/terminordle/"
  url "https://registry.npmjs.org/@hp4k1h5/terminordle/-/terminordle-0.1.0.tgz"
  sha256 "f1153c34b8da36c3269e8d134707d27b7a72091ea0c90a658b759f889d64a1aa"
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
